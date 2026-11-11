import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { loadText, generatePages, TEXT_FILE } from './generate.mjs'

const CONFIG_FILE = fileURLToPath(import.meta.url)

// 读取网页文字总表，并据此生成全部页面（每次构建 / 启动预览时执行）
const t = loadText()
const firstDoc = generatePages(t)
const ui = t.界面

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  VitePress 站点配置：所有显示文字取自 网页文字.yaml
// 参数说明  无
// 返回参数  VitePress 配置对象
// 使用示例  由 vitepress dev / vitepress build 自动加载
// 备注信息  base 为 '/'，适配 Cloudflare Pages 根域名部署；
//           vite.server.watch 监听 网页文字.yaml，本地预览时修改即自动重启生效
//-------------------------------------------------------------------------------------------------------------------
export default defineConfig({
  lang: 'zh-CN',
  title: String(t.站点.名称),
  description: String(t.站点.描述),
  base: '/',
  cleanUrls: true,
  // 内部说明文档只保留在仓库中，不发布为网页
  srcExclude: ['DEPLOY.md', 'readme.md', 'README.md', '操作指南.md'],
  vite: {
    plugins: [
      {
        // 本地预览时：网页文字.yaml 改动后，更新本配置文件的修改时间，
        // 交给 VitePress 自带的配置重载机制重启预览、重新生成页面
        name: 'watch-text-yaml',
        configureServer(server) {
          server.watcher.add(TEXT_FILE)
          server.watcher.on('change', (file) => {
            if (file.replace(/\\/g, '/') !== TEXT_FILE.replace(/\\/g, '/')) return
            const now = new Date()
            fs.utimesSync(CONFIG_FILE, now, now)
          })
        }
      }
    ]
  },
  themeConfig: {
    nav: [
      { text: String(t.导航.首页), link: '/' },
      { text: String(t.导航.产品中心), link: '/products/', activeMatch: '^/products/' },
      { text: String(t.导航.文档中心), link: firstDoc, activeMatch: '^/docs/' },
      { text: String(t.导航.代码下载), link: '/code/' },
      { text: String(t.导航.更新日志), link: '/changelog/' }
    ],
    sidebar: {
      '/products/': [
        {
          text: String(t.导航.产品中心),
          link: '/products/',
          items: t.产品系列.map((s) => ({ text: String(s.名称), link: `/products/${s.目录}` }))
        }
      ],
      '/docs/': t.文档中心.分组.map((g) => ({
        text: String(g.标题),
        items: g.页面.map((p) => ({ text: String(p.标题), link: `/docs/${p.文件}` }))
      }))
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: String(ui.搜索按钮), buttonAriaLabel: String(ui.搜索按钮) },
          modal: {
            displayDetails: String(ui.搜索显示详情),
            resetButtonTitle: String(ui.搜索清除),
            backButtonTitle: String(ui.搜索返回),
            noResultsText: String(ui.搜索无结果),
            footer: {
              selectText: String(ui.搜索选择),
              navigateText: String(ui.搜索切换),
              closeText: String(ui.搜索关闭)
            }
          }
        }
      }
    },
    outline: { label: String(ui.本页目录) },
    docFooter: { prev: String(ui.上一页), next: String(ui.下一页) },
    returnToTopLabel: String(ui.返回顶部),
    sidebarMenuLabel: String(ui.菜单),
    darkModeSwitchLabel: String(ui.外观),
    lightModeSwitchTitle: String(ui.切换到浅色),
    darkModeSwitchTitle: String(ui.切换到深色),
    skipToContentLabel: String(ui.跳到正文),
    notFound: {
      title: String(ui.页面不存在标题),
      quote: String(ui.页面不存在说明),
      linkText: String(ui.页面不存在按钮),
      linkLabel: String(ui.页面不存在按钮)
    },
    footer: { message: String(t.站点.页脚说明), copyright: String(t.站点.页脚版权) },
    // 供主题组件（首页卡片区标题、下载列表表头）读取
    pageText: {
      featuresTitle: String(t.首页.卡片区标题),
      download: {
        name: String(t.下载列表.文件名),
        size: String(t.下载列表.大小),
        action: String(t.下载列表.下载),
        empty: String(t.下载列表.无文件)
      }
    }
  }
})
