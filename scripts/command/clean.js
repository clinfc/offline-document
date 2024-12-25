import consola from 'consola'
import fsglob from 'fast-glob'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

export default function clean(options) {
  const file = resolve(process.cwd(), '.gitignore')
  if (!existsSync(file)) return consola.error(`未找到 .gitignore 文件`)

  const text = readFileSync(file, { encoding: 'utf-8' })

  const includes = text
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!includes.length)
    return consola.warn('当前还未配置相关信息，请在 .gitignore 文件中添加')

  const targets = fsglob.globSync(includes, {
    deep: 100,
    caseSensitiveMatch: false,
    dot: true,
    unique: true,
    baseNameMatch: true,
    onlyFiles: false,
    absolute: true,
  })

  if (options.stdout) {
    writeFileSync(resolve(process.cwd(), options.stdout), targets.join('\n'), {
      encoding: 'utf-8',
    })
  }

  targets.forEach((file) => {
    rm(file, { recursive: true, force: true }).then(
      () => {
        consola.success(`已删除：${file}`)
      },
      (reason) => {
        consola.error(`删除失败：${file}\n 失败原因：${reason}`)
      }
    )
  })
}
