import { resolve } from 'node:path'
import { networkInterfaces } from 'node:os'
import consola from 'consola'
import { defineConfig } from 'vite'
import { tasksCacheFile } from '../shared/const.js'
import { readJson } from '../shared/utils.js'

function getHostAddress() {
  const interfaces = Object.values(networkInterfaces()).flat()

  for (let i = interfaces.length; i--; ) {
    const inter = interfaces[i]
    if (inter.family === 'IPv4' && !inter.internal) {
      return inter.address
    }
  }
}

export default defineConfig(({}) => {
  return {
    root: resolve(__dirname),
    server: {
      host: true,
    },
    plugins: [
      {
        name: 'home',
        transformIndexHtml(html) {
          const tasks = readJson(tasksCacheFile, [])
          const hostAddress = getHostAddress()
          const list = tasks
            .map(({ name, port, host, https }) => {
              const protocol = https ? 'https:' : 'http:'
              const addressMap = {
                Local: `${protocol}//127.0.0.1:${port}`,
              }
              if (host) {
                if (typeof host === 'string') {
                  addressMap.Network = host
                } else if (hostAddress) {
                  addressMap.Network = `${protocol}//${hostAddress}:${port}`
                }
              }
              const href = Object.entries(addressMap)
                .map(([type, href]) => {
                  return `<li>${type}: <a href="${href}" target="_blank">${href}</a></li>`
                })
                .join('')
              return `<li><div><b>${name}</b></div><ul>${href}</ul></li>`
            })
            .join('')
          const content = `<h3>本次启动的文档有：</h3><ol>${list}</ol>`
          return html.replace('#app', content)
        },
        configureServer({ httpServer }) {
          httpServer?.once('listening', () => {
            consola.log('\n')
            consola.start(`主服务为：home:${httpServer.address().port}`)
          })
        },
      },
    ],
  }
})
