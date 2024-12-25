import fsglob from 'fast-glob'
import { resolve } from 'node:path'
import { mkdirSync, rm, rmdirSync, rmSync } from 'node:fs'
import {
  packCacheDirectory,
  readJson,
  runTasks,
  isObject,
} from '../shared/index.js'

const cwd = resolve(process.cwd(), 'node_modules')

function validate(list, file) {
  const items = file.split('/')
  const pkg = items.pop()
  for (let i = items.length; --i; ) {
    const target = [...items.slice(0, i), pkg].join('/')
    if (list.includes(target)) return false
  }
  return true
}

export default function pack(options) {
  options = isObject(options) ? options : {}
  rmSync(packCacheDirectory, { recursive: true })

  const json = fsglob.globSync('**/**/package.json', {
    cwd,
    onlyFiles: true,
  })

  const tasks = []

  json.forEach((file) => {
    if (!validate(json, file)) return
    const { name, version } = readJson(resolve(cwd, file), {})
    if (name && version) {
      tasks.push({
        name,
        file,
        args: [
          'pack',
          `${name}@${version}`,
          '--pack-destination',
          packCacheDirectory,
        ],
      })
    }
  })

  if (!tasks.length) return
  mkdirSync(packCacheDirectory, { recursive: true })

  runTasks('npm', tasks).then(() => {
    if (options.clear) {
      rm(cwd, { recursive: true })
    }
  })
}
