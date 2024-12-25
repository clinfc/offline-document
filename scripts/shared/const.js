import { resolve } from 'node:path'
import { dirname } from './utils.js'

export const vitePreviewFile = resolve(dirname(), '../.vite/vite.preview.js')

export const viteHomeFile = resolve(dirname(), '../.vite/vite.home.js')

export const tasksCacheFile = resolve(dirname(), '../.vite/.tasks.json')

export const packCacheDirectory = resolve(dirname(), '../.pack')
