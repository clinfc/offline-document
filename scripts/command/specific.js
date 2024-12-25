import { preview } from 'vite'
import ssl from '@vitejs/plugin-basic-ssl'

export default async function run(target, options) {
  const server = await preview({
    preview: options,
    build: {
      outDir: target,
    },
    plugins: options.https ? [ssl()] : undefined,
  })

  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}
