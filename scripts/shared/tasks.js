import spawn from '../spawn/index.cjs'
import { convert, isObject, arrayRemove, NpmRunAllError } from './utils.js'

export function runTask(command, { name, args, stdio }) {
  let cp = spawn(command, args, {
    stdio: stdio || ['ignore', 'inherit', 'inherit'],
  })

  const promise = new Promise((resolve, reject) => {
    cp.on('error', (err) => {
      cp = null
      reject(err)
    })
    cp.on('close', (code, signal) => {
      cp = null
      resolve({ name, code, signal })
    })
  })

  promise.abort = function abort() {
    if (cp) {
      cp.kill()
      cp = null
    }
  }

  return promise
}

export function runTasks(command, tasks, childProcessConfig) {
  return new Promise((resolve, reject) => {
    if (!tasks.length) {
      return resolve([])
    }

    childProcessConfig = isObject(childProcessConfig) ? childProcessConfig : {}

    const queue = [...tasks],
      results = tasks.map(({ name }) => ({ name, code: undefined })),
      promises = []
    let aborted = false,
      error = null

    function done() {
      error ? reject(error) : resolve(tasks)
    }

    function abort() {
      if (aborted) return

      aborted = true

      if (!promises.length) {
        done()
      } else {
        promises.forEach((promise) => promise.abort())
        Promise.allSettled(promises).then(done, reject)
      }
    }

    function next() {
      if (!queue.length) {
        if (!promises.length) done()
        return
      }

      const task = queue.shift()
      const promise = runTask(command, task)

      promises.push(promise)

      promise.then(
        (result) => {
          arrayRemove(promises, promise)
          if (aborted) return
          if (result.code === null && result.signal !== null) {
            // Ref: https://nodejs.org/api/process.html#process_exit_codes
            result.code = 128 + convert(result.signal)
          }
          results.find(({ name }) => name === task.name).code = result.code

          // Aborts all tasks if it's an error.
          if (result.code) {
            error = new NpmRunAllError(result, results)
            if (!childProcessConfig.continueOnError) {
              return abort()
            }
          }

          // Aborts all tasks if options.race is true.
          if (childProcessConfig.race && !result.code) {
            return abort()
          }

          next()
        },
        (error) => {
          arrayRemove(promises, promise)
          if (!childProcessConfig.continueOnError || childProcessConfig.race) {
            error = thisError
            return abort()
          }
          next()
        }
      )
    }

    for (let i = 0; i < tasks.length; i++) next()
  })
}
