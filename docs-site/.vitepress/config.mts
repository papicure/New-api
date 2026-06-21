import { defineConfig } from 'vitepress'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sidebars = require('../.vitepress-sidebar.json') as {
  zh: any[]
  en: any[]
}

// Deployed under https://www.papicure.de/docs/
export default defineConfig({
  base: '/docs/',
  title: 'PaPiCode Docs',
  description:
    'PaPiCode 文档中心：AI API 中转、Token 额度、订阅套餐、客户端接入与常见问题。',
  lastUpdated: true,
  cleanUrls: true,
  srcExclude: ['_scrape/**', 'README.md'],
  appearance: 'dark',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }],
  ],

  themeConfig: {
    siteTitle: 'PaPiCode',
    search: { provider: 'local' },
    socialLinks: [],
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '快速开始', link: '/guide/quickstart' },
          { text: '客户端', link: '/guide/clients/cursor' },
          { text: '控制台', link: 'https://www.papicure.de' },
        ],
        sidebar: sidebars.zh,
        outline: { label: '本页目录', level: [2, 3] },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '切换语言',
        footer: {
          message: 'AI API Gateway Documentation',
          copyright: '© 2026 PaPiCode',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Quickstart', link: '/en/guide/quickstart' },
          { text: 'Clients', link: '/en/guide/clients/cursor' },
          { text: 'Console', link: 'https://www.papicure.de' },
        ],
        sidebar: sidebars.en,
        outline: { label: 'On this page', level: [2, 3] },
        footer: {
          message: 'AI API Gateway Documentation',
          copyright: '© 2026 PaPiCode',
        },
      },
    },
  },
})
