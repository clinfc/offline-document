import fsglob from 'fast-glob'
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  vitePreviewFile,
  viteHomeFile,
  isObject,
  readJson,
  runTasks,
  tasksCacheFile,
} from '../shared/index.js'

function writeTasks(tasks) {
  if (!Array.isArray(tasks)) return
  const json = tasks.map(({ name, viteConfig: { host, port, https } }) => {
    return { name, host, port, https }
  })
  writeFileSync(tasksCacheFile, JSON.stringify(json), { flag: 'w+' })
}

function createHomeTask(homeViteConfig) {
  return {
    name: 'home',
    args: normolizeViteArgs(
      ['vite', 'serve', '--config', viteHomeFile],
      homeViteConfig
    ),
    viteConfig: homeViteConfig,
  }
}

function normolizeViteArgs(args, viteConfig) {
  const { host, open, port, strictPort } = isObject(viteConfig)
    ? viteConfig
    : {}

  host && args.push('--host') && typeof host === 'string' && args.push(host)
  open && args.push('--open')
  port && args.push('--port', port)
  strictPort && args.push('--strictPort')

  return args
}

function createPreviewArgs(task) {
  const { name, viteConfig } = task

  const args = [
    'vite',
    'preview',
    '--outDir',
    name,
    '--config',
    vitePreviewFile,
  ]

  return normolizeViteArgs(args, viteConfig)
}

function createPreviewTasks(list, viteConfig) {
  const { host, port, open, strictPort, ...rest } = isObject(viteConfig)
    ? viteConfig
    : {}
  const tasks = list.map((name, index) => {
    const { port: privitePort, ...priviteCofnig } = isObject(rest[name])
      ? rest[name]
      : {}

    const config = {
      name,
      viteConfig: {
        host,
        open,
        strictPort,
        ...priviteCofnig,
        port: privitePort ? privitePort : port + index,
      },
    }
    config.args = createPreviewArgs(config)

    return config
  })

  writeTasks(tasks)
  return tasks
}

export default function run(configFile) {
  const filePath = path.resolve(
    process.cwd(),
    configFile || 'server.config.json'
  )
  if (!existsSync(filePath)) throw new Error(`配置文件不存在：${filePath}`)

  const { include, exclude, viteConfig, homeViteConfig, childProcessConfig } =
    readJson(filePath)

  const list = fsglob.globSync(include, {
    deep: 1,
    ignore: exclude,
    onlyDirectories: true,
  })

  const tasks = createPreviewTasks(list, viteConfig)
  homeViteConfig?.run !== false && tasks.push(createHomeTask(homeViteConfig))

  return runTasks('npx', tasks, childProcessConfig)
}
