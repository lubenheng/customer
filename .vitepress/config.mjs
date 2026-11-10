import { defineConfig } from 'vitepress'

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  VitePress 站点配置（标题、导航、侧边栏、本地搜索）
// 参数说明  无
// 返回参数  VitePress 配置对象
// 使用示例  由 vitepress dev / vitepress build 自动加载
// 备注信息  base 为 '/'，适配 Cloudflare Pages 根域名部署
//-------------------------------------------------------------------------------------------------------------------
export default defineConfig({
  lang: 'zh-CN',
  title: '上海灿瑞科技股份有限公司',
  description: '产品文档、应用笔记与代码下载',
  base: '/',
  cleanUrls: true,
  // 内部说明文档只保留在仓库中，不发布为网页
  srcExclude: ['DEPLOY.md', 'R2-SETUP.md', 'readme.md', 'README.md', '操作指南.md'],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '产品中心', link: '/products/' },
      { text: '文档中心', link: '/docs/getting-started' },
      { text: '代码下载', link: '/code/' },
      { text: '更新日志', link: '/changelog/' }
    ],
    sidebar: {
      '/products/': [
        {
          text: '产品中心',
          link: '/products/',
          items: [
            { text: '产品系列一', link: '/products/series-1' },
            { text: '产品系列二', link: '/products/series-2' },
            { text: '产品系列三', link: '/products/series-3' }
          ]
        }
      ],
      '/docs/': [
        { text: '快速开始', items: [{ text: '快速开始', link: '/docs/getting-started' }] },
        { text: '用户手册', items: [{ text: '用户手册', link: '/docs/manual' }] },
        { text: '应用笔记', items: [{ text: '应用笔记', link: '/docs/notes' }] }
      ]
    },
    search: { provider: 'local' },
    outline: { label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: { message: '产品文档、应用笔记与代码下载', copyright: 'Copyright © 2026 上海灿瑞科技股份有限公司' }
  }
})
