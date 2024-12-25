import { readFileSync } from 'node:fs'
import { dirname as pathDirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function dirname(url) {
  const __filename = fileURLToPath(url || import.meta.url)
  return pathDirname(__filename)
}

const signals = {
  SIGABRT: 6,
  SIGALRM: 14,
  SIGBUS: 10,
  SIGCHLD: 20,
  SIGCONT: 19,
  SIGFPE: 8,
  SIGHUP: 1,
  SIGILL: 4,
  SIGINT: 2,
  SIGKILL: 9,
  SIGPIPE: 13,
  SIGQUIT: 3,
  SIGSEGV: 11,
  SIGSTOP: 17,
  SIGTERM: 15,
  SIGTRAP: 5,
  SIGTSTP: 18,
  SIGTTIN: 21,
  SIGTTOU: 22,
  SIGUSR1: 30,
  SIGUSR2: 31,
}

/**
 * Converts a signal name to a number.
 * @param {string} signal - the signal name to convert into a number
 * @returns {number} - the return code for the signal
 */
export function convert(signal) {
  return signals[signal] || 0
}

export function isObject(target) {
  return Object.prototype.toString.call(target) === '[object Object]'
}

export function arrayRemove(list, target) {
  for (let i = list.length; i--; ) {
    if (list[i] === target) {
      return list.splice(i, 1)
    }
  }
}

export class NpmRunAllError extends Error {
  constructor(causeResult, allResults) {
    super(`"${causeResult.name}" exited with ${causeResult.code}.`)
    this.name = causeResult.name
    this.code = causeResult.code
    this.results = allResults
  }
}

export function readJson(file, defaultValue) {
  try {
    const txt = readFileSync(file, { encoding: 'utf-8' })
    return JSON.parse(txt)
  } catch (error) {
    console.error(error)
    return defaultValue
  }
}
