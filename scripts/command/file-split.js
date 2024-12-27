import consola from 'consola'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { dirname } from '../shared/utils.js'

export default async function splitFile(target, options) {
  const file = resolve(process.cwd(), target)
  if (!existsSync(file)) return consola.error(`${file} 不存在`)
  if (!statSync(file).isFile()) return consola.error(`${file} 不是一个文件`)

  const dir = resolve(process.cwd(), options.dir)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const buffer = await readFile(file)

  const postfix = file.split('.').pop()
  const size = options.size * 1024 * 1024
  const chunks = []
  for (let i = 0; i < buffer.length; ) {
    chunks.push(buffer.subarray(i, (i += size)))
  }
  const prefix = options.prefix || Math.random().toString(36).slice(2)
  const joinChar = options.joinChar || '-'
  const names = Array(chunks.length)
    .fill(null)
    .map((_, index) => {
      const sort = String(index + 1).padStart(3, 0)
      return `${prefix}${joinChar}${sort}`
    })
  const list = chunks.map((chunk, index) =>
    writeFile(resolve(dir, names[index]), chunk)
  )
  const settled = await Promise.allSettled(list)
  const isFinish = settled.every(({ status }) => status == 'fulfilled')
  if (!isFinish) return consola.error(`${file} 拆分未完成`)

  createMergeFile(dir, { prefix, postfix, files: names })
  consola.success(`已拆分完毕！`)
}

function createMergeFile(dir, config) {
  const jsFile = resolve(dirname(import.meta.url), './file-join.js')
  const jsText = readFileSync(jsFile, { encoding: 'utf-8' })
  writeFileSync(
    resolve(dir, `${config.prefix}.js`),
    jsText.replace('run({})', `run(${JSON.stringify(config)})`)
  )
}
