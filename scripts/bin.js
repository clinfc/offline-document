#!/usr/bin/env node

import { program } from 'commander'
import { resolve } from 'node:path'
import specific from './command/specific.js'
import serve from './command/serve.js'
import pack from './command/pack.js'
import { readJson } from './shared/index.js'
import clean from './command/clean.js'

const { version, bin } = readJson(resolve(process.cwd(), 'package.json'))

program.name(Object.keys(bin)[0]).usage('<command> [options]').version(version)

program
  .command('specific <target>')
  .description('启动特定服务')
  .option('--host [host]', '指定主机名称', false)
  .option('--port <port>', '指定端口号')
  .option('--open [path]', '是否直接在浏览器打开', false)
  .option('--strictPort', '如果指定的端口已在使用中，则退出', false)
  .option('--https', '使用 https 服务', false)
  .action((target, optiions) => {
    specific(target, optiions)
  })

program
  .command('serve')
  .description('根据配置文件启动服务')
  .option('--config <file>', '配置文件')
  .action(({ config }) => {
    serve(config)
  })

program
  .command('pack')
  .description('对所有依赖执行 npm pack')
  .option('--clear', '成功后移除 node_modules 目录', false)
  .action(pack)

program
  .command('clean')
  .description('根据 .gitignore 配置进行文件清理')
  .option('--stdout <file>', '将匹配到的 ignore 信息输入到文件')
  .action(clean)

program.parse(process.argv)
