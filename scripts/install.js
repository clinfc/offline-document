import { resolve, join as pathJoin } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import { readJson } from './shared/utils.js'
import { packCacheDirectory } from './shared/const.js'
import { exec } from 'node:child_process'

if (existsSync(packCacheDirectory)) {
  const sourceList = readdirSync(packCacheDirectory)
  if (!sourceList.length) throw new Error('未找到可安装资源')

  const { dependencies } = readJson(resolve(process.cwd(), 'package.json'))
  const nameList = Object.keys(dependencies)

  const targetList = []
  const notList = []

  const relativePath = packCacheDirectory.replace(process.cwd(), '')
  nameList.forEach((name) => {
    const target = sourceList.find((source) => source.includes(name))
    target
      ? targetList.push('.' + pathJoin(relativePath, target))
      : notList.push(name)
  })

  if (!targetList.length) throw new Error('未匹配到可安装资源')
  const command = `npm i ${targetList.join(' ')}`

  console.log(command)

  exec(command, (error, stdout, stderr) => {
    console.log(error, stdout, stderr)
  })
}
