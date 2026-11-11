import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { loadText, generatePages, TEXT_FILE } from './generate.mjs'

// 下载文件夹中的说明表文件名（与 theme/downloads.data.mjs 中一致）
const META_FILE = '文件说明.yaml'
const CONFIG_FILE = fileURLToPath(import.meta.url)

// 读取网页文字总表，并据此生成全部页面（每次构建 / 启动预览时执行）
const t = loadText()
const firstDoc = generatePages(t)
const ui = t.界面

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  递归删除目录中的「文件说明.yaml」
// 参数说明  dir 构建输出中的下载目录（.vitepress/dist/downloads）
// 返回参数  无
// 使用示例  removeMetaFiles('.vitepress/dist/downloads')
// 备注信息  目录不存在时直接返回
//-------------------------------------------------------------------------------------------------------------------
function removeMetaFiles(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) removeMetaFiles(full)
    else if (e.name === META_FILE) fs.rmSync(full)
  }
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  HTML 转义（页脚文字以 HTML 方式渲染，需转义 < > & ）
// 参数说明  s 原始文字
// 返回参数  转义后的字符串
// 使用示例  esc('A & B') // 'A &amp; B'
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

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
  // 构建完成后，从输出中删除各下载文件夹里的「文件说明.yaml」（只用于生成列表，不对外提供下载）
  buildEnd(site) {
    removeMetaFiles(path.join(site.outDir, 'downloads'))
  },
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
      // 顺序：首页、产品中心、代码下载、文档中心
      { text: String(t.导航.代码下载), link: '/code/' },
      { text: String(t.导航.文档中心), link: firstDoc, activeMatch: '^/docs/' },
      // 更新日志设为不发布时，导航中不显示
      ...(t.更新日志.已发布 ? [{ text: String(t.导航.更新日志), link: '/changelog/' }] : [])
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
    // 页脚以 HTML 方式显示，文字先转义；免责声明作为第二行说明文字，留空则不显示
    footer: {
      message: [t.站点.页脚说明, t.站点.页脚免责]
        .map((s) => esc(s).trim())
        .filter(Boolean)
        .map((s, i) => (i === 0 ? s : `<span class="footer-disclaimer">${s}</span>`))
        .join('<br>'),
      copyright: esc(t.站点.页脚版权)
    },
    // 供主题组件（首页卡片区标题、下载列表表头、样片申请表单）读取
    pageText: {
      featuresTitle: String(t.首页.卡片区标题),
      contact: {
        title: String(t.首页.联系我们.标题),
        address: String(t.首页.联系我们.地址).trim(),
        phone: String(t.首页.联系我们.电话).trim(),
        email: String(t.首页.联系我们.邮箱).trim(),
        addressLabel: String(t.首页.联系我们.地址标签),
        phoneLabel: String(t.首页.联系我们.电话标签),
        emailLabel: String(t.首页.联系我们.邮箱标签)
      },
      sample: {
        intro: String(t.样片申请.说明),
        series: String(t.样片申请.产品),
        company: String(t.样片申请.公司名称),
        contact: String(t.样片申请.联系人),
        phone: String(t.样片申请.联系电话),
        email: String(t.样片申请.联系邮箱),
        note: String(t.样片申请.申请说明),
        notePlaceholder: String(t.样片申请.申请说明提示),
        submit: String(t.样片申请.提交按钮),
        sending: String(t.样片申请.提交中),
        success: String(t.样片申请.成功),
        fail: String(t.样片申请.失败),
        required: String(t.样片申请.必填提示),
        badEmail: String(t.样片申请.邮箱格式错误),
        back: String(t.样片申请.返回上一页)
      },
      download: {
        name: String(t.下载列表.文件名),
        desc: String(t.下载列表.说明),
        version: String(t.下载列表.版本),
        date: String(t.下载列表.更新日期),
        size: String(t.下载列表.大小),
        action: String(t.下载列表.下载),
        empty: String(t.下载列表.无文件)
      }
    }
  }
})
