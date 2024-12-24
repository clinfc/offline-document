import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '混合的文档',
  description: '',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '库',
        items: [
          {
            text: 'async-validator',
            link: '/async-validator/zh',
          },
          {
            text: 'fast-glob',
            link: '/fast-glob/en',
          },
        ],
      },
    ],

    sidebar: [
      {
        text: 'async-validator',
        items: [
          { text: '中文', link: '/async-validator/zh' },
          { text: '英文', link: '/async-validator/en' },
        ],
      },
      {
        text: 'fast-glob',
        items: [{ text: '英文', link: '/fast-glob/en' }],
      },
    ],
  },
})
