import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

// 项目根目录与文字总表路径
export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const TEXT_FILE = path.join(ROOT, '网页文字.yaml')

// 网址片段只允许英文小写、数字、短横线
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  抛出带中文说明的配置错误
// 参数说明  where 出错位置（如「产品系列 第 2 项」）；msg 问题说明
// 返回参数  无（直接抛出异常，构建中止）
// 使用示例  fail('产品系列 第 1 项', '缺少「名称」')
// 备注信息  错误信息会显示在终端和 Cloudflare 构建日志中
//-------------------------------------------------------------------------------------------------------------------
function fail(where, msg) {
  throw new Error(`[网页文字.yaml] ${where}：${msg}`)
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  读取对象中的必填字段，并转为字符串
// 参数说明  obj 父对象；key 字段名；where 出错位置
// 返回参数  字段值（字符串）
// 使用示例  req(series, '名称', '产品系列 第 1 项')
// 备注信息  允许空字符串 ''；缺失或为 null 时报错
//-------------------------------------------------------------------------------------------------------------------
function req(obj, key, where) {
  if (!obj || typeof obj !== 'object') fail(where, '格式错误，应为「名称: 内容」形式的一组字段')
  const v = obj[key]
  if (v === undefined || v === null) fail(where, `缺少「${key}」`)
  if (typeof v === 'object') fail(where, `「${key}」应为文字，不能是列表或分组`)
  return String(v)
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  读取必填的列表字段
// 参数说明  obj 父对象；key 字段名；where 出错位置
// 返回参数  数组
// 使用示例  list(table, '数据', '产品系列一 选型表')
// 备注信息  空列表合法
//-------------------------------------------------------------------------------------------------------------------
function list(obj, key, where) {
  if (!obj || typeof obj !== 'object') fail(where, '格式错误')
  const v = obj[key]
  if (!Array.isArray(v)) fail(where, `「${key}」应为列表（每项以「- 」开头，或写成 [a, b, c]）`)
  return v
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  检查网址片段格式并查重
// 参数说明  value 片段；seen 已使用集合；where 出错位置；key 字段名
// 返回参数  无
// 使用示例  checkSlug('series-1', seen, '产品系列 第 1 项', '目录')
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function checkSlug(value, seen, where, key) {
  if (!SLUG_RE.test(value)) fail(where, `「${key}: ${value}」只能使用英文小写、数字和短横线`)
  if (seen.has(value)) fail(where, `「${key}: ${value}」与前面重复`)
  seen.add(value)
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  读取并校验网页文字总表
// 参数说明  无
// 返回参数  解析后的对象
// 使用示例  const t = loadText()
// 备注信息  YAML 语法错误、字段缺失、表格列数不一致时抛出带行号或位置的中文错误
//-------------------------------------------------------------------------------------------------------------------
export function loadText() {
  if (!fs.existsSync(TEXT_FILE)) fail('文件', '找不到 网页文字.yaml')
  const raw = fs.readFileSync(TEXT_FILE, 'utf-8').replace(/^﻿/, '')
  const doc = YAML.parseDocument(raw, { prettyErrors: true })
  if (doc.errors.length) fail('格式错误', '\n' + doc.errors.map((e) => e.message).join('\n'))
  const t = doc.toJS()
  if (!t || typeof t !== 'object') fail('文件', '内容为空')

  // 必填文字字段
  for (const k of ['名称', '描述', '页脚说明', '页脚版权', '页脚免责']) req(t.站点, k, '站点')
  for (const k of ['首页', '产品中心', '代码下载', '资料下载', '开发支持', '更新日志']) req(t.导航, k, '导航')
  for (const k of ['标题', '副标题', '系列区标题', '系列区按钮', '卡片区标题', '最新资料标题', '查看全部']) req(t.首页, k, '首页')
  if (!/^\d+$/.test(req(t.首页, '最新资料数量', '首页'))) fail('首页', '「最新资料数量」应为整数，0 表示不显示')
  const heroBtns = list(t.首页, '按钮', '首页')
  if (!heroBtns.length) fail('首页 按钮', '至少需要 1 个')
  heroBtns.forEach((b, i) => { req(b, '文字', `首页 按钮 第 ${i + 1} 个`); req(b, '链接', `首页 按钮 第 ${i + 1} 个`) })
  list(t.首页, '卡片', '首页').forEach((c, i) => {
    for (const k of ['标题', '说明', '链接']) req(c, k, `首页 卡片 第 ${i + 1} 张`)
  })
  for (const k of ['标题', '地址', '电话', '邮箱', '地址标签', '电话标签', '邮箱标签']) req(t.首页.联系我们, k, '首页 联系我们')
  for (const k of ['横幅标题', '横幅说明', '列表标题']) req(t.产品中心, k, '产品中心')
  if (list(t.产品中心, '列表表头', '产品中心').length !== 2) fail('产品中心 列表表头', '应为 2 项，如 [系列, 简介]')

  const sp = t.产品系列页
  for (const k of ['返回按钮', '选型标题', '资料标题', '应用标题', '筛选提示', '无匹配']) req(sp, k, '产品系列页')
  list(sp, '按钮', '产品系列页').forEach((b, i) => { req(b, '文字', `产品系列页 按钮 第 ${i + 1} 个`); req(b, '链接', `产品系列页 按钮 第 ${i + 1} 个`) })
  const folderSeen = new Set()
  list(sp, '资料分组', '产品系列页').forEach((g, i) => {
    const where = `产品系列页 资料分组 第 ${i + 1} 项`
    req(g, '名称', where)
    checkSlug(req(g, '文件夹', where), folderSeen, where, '文件夹')
  })

  const head = list(sp, '选型表头', '产品系列页')
  if (!head.length) fail('产品系列页 选型表头', '至少需要 1 列')
  head.forEach((h, i) => { req(h, '中文', `产品系列页 选型表头 第 ${i + 1} 列`); req(h, '英文', `产品系列页 选型表头 第 ${i + 1} 列`) })

  const seriesSeen = new Set()
  const series = list(t, '产品系列', '产品系列')
  if (!series.length) fail('产品系列', '至少需要 1 个系列')
  series.forEach((s, i) => {
    const where = `产品系列 第 ${i + 1} 项`
    req(s, '名称', where)
    req(s, '简介', where)
    checkSlug(req(s, '目录', where), seriesSeen, where, '目录')
    // 关键参数（横幅下方的参数卡片）、典型应用：均可不写
    if (s.关键参数 !== undefined) {
      list(s, '关键参数', where).forEach((k, j) => { req(k, '名称', `${where} 关键参数 第 ${j + 1} 项`); req(k, '值', `${where} 关键参数 第 ${j + 1} 项`) })
    }
    if (s.典型应用 !== undefined && s.典型应用 !== null && typeof s.典型应用 === 'object') fail(where, '「典型应用」应为一行文字')
    if (!s.选型表 || typeof s.选型表 !== 'object') fail(where, '缺少「选型表」')
    if (s.选型表.表头 !== undefined) fail(`${s.名称} 选型表`, '表头已统一移到「产品系列页 → 选型表头」，请删除这里的「表头」')
    list(s.选型表, '数据', `${s.名称} 选型表`).forEach((row, r) => {
      if (!Array.isArray(row)) fail(`${s.名称} 选型表 数据 第 ${r + 1} 行`, '应写成 [值1, 值2, ...]')
      if (row.length !== head.length) fail(`${s.名称} 选型表 数据 第 ${r + 1} 行`, `有 ${row.length} 格，选型表头有 ${head.length} 列，必须一致`)
    })
  })

  // 开发支持：文章正文写在 support/<文件>.md（独立 Markdown 文件），这里只登记分组、标题和发布状态
  for (const k of ['横幅标题', '横幅说明']) req(t.开发支持, k, '开发支持')
  const supSeen = new Set()
  const supGroups = list(t.开发支持, '分组', '开发支持')
  supGroups.forEach((g, i) => {
    const where = `开发支持 分组 第 ${i + 1} 项`
    req(g, '标题', where)
    list(g, '文章', where).forEach((p, j) => {
      const pw = `${where} 文章 第 ${j + 1} 篇`
      req(p, '标题', pw)
      req(p, '说明', pw)
      const f = req(p, '文件', pw)
      if (f === 'index') fail(pw, '「文件」不能用 index（已用于开发支持首页）')
      checkSlug(f, supSeen, pw, '文件')
      if (p.发布 !== undefined && !['是', '否', true, false].includes(p.发布)) fail(pw, '「发布」只能写 是 或 否')
      const published = p.发布 !== '否' && p.发布 !== false
      if (published && !fs.existsSync(path.join(ROOT, 'support', `${f}.md`))) fail(pw, `找不到正文文件 support/${f}.md`)
    })
  })
  // 「发布: 否」的文章不参与构建（config.mjs 的 srcExclude 使用）
  t.开发支持.未发布 = supGroups.flatMap((g) => g.文章.filter((p) => p.发布 === '否' || p.发布 === false).map((p) => `support/${p.文件}.md`))
  // 去掉「发布: 否」的文章；某分组全部不发布时整组不显示；一篇都没有时导航不显示「开发支持」
  t.开发支持.分组 = supGroups
    .map((g) => ({ ...g, 文章: g.文章.filter((p) => p.发布 !== '否' && p.发布 !== false) }))
    .filter((g) => g.文章.length)
  t.开发支持.已发布 = t.开发支持.分组.length > 0

  req(t.代码下载, '标题', '代码下载')
  req(t.代码下载, '说明', '代码下载')
  const codeSeen = new Set()
  const codeGroups = list(t.代码下载, '分组', '代码下载')
  if (!codeGroups.length) fail('代码下载 分组', '至少需要 1 个分组')
  codeGroups.forEach((g, i) => {
    const where = `代码下载 分组 第 ${i + 1} 项`
    req(g, '名称', where)
    checkSlug(req(g, '文件夹', where), codeSeen, where, '文件夹')
  })
  for (const k of ['文件名', '说明', '版本', '更新日期', '大小', '下载', '无文件']) req(t.下载列表, k, '下载列表')
  for (const k of ['标题', '说明', '全部系列', '全部类型', '搜索提示', '系列', '类型', '无匹配']) req(t.资料下载, k, '资料下载')
  for (const k of ['标题', '说明', '产品', '公司名称', '联系人', '联系电话', '联系邮箱', '申请说明', '申请说明提示',
    '提交按钮', '提交中', '成功', '失败', '必填提示', '邮箱格式错误', '返回上一页']) req(t.样片申请, k, '样片申请')
  for (const k of ['标题', '正文']) req(t.更新日志, k, '更新日志')
  if (t.更新日志.发布 !== undefined && !['是', '否', true, false].includes(t.更新日志.发布)) fail('更新日志', '「发布」只能写 是 或 否')
  t.更新日志.已发布 = t.更新日志.发布 !== '否' && t.更新日志.发布 !== false
  for (const k of ['本页目录', '上一页', '下一页', '返回顶部', '菜单', '外观', '切换到浅色', '切换到深色', '跳到正文',
    '搜索按钮', '搜索无结果', '搜索显示详情', '搜索清除', '搜索返回', '搜索选择', '搜索切换', '搜索关闭',
    '页面不存在标题', '页面不存在说明', '页面不存在按钮']) req(t.界面, k, '界面')
  return t
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  HTML 转义
// 参数说明  s 原始文字
// 返回参数  转义后的文字
// 使用示例  html('A & B') // 'A &amp; B'
// 备注信息  用于写入 HTML 标签内的文字和属性
//-------------------------------------------------------------------------------------------------------------------
function html(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成 Markdown 表格单元格文字
// 参数说明  s 原始文字
// 返回参数  可安全放入表格的文字
// 使用示例  cell('A|B') // 'A\\|B'
// 备注信息  转义竖线、去掉换行；空值显示为空
//-------------------------------------------------------------------------------------------------------------------
function cell(s) {
  return html(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成 Markdown 表格
// 参数说明  head 表头数组；rows 二维数组
// 返回参数  表格 Markdown 文本
// 使用示例  table(['A', 'B'], [['1', '2']])
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function table(head, rows) {
  const lines = [`| ${head.map(cell).join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`]
  for (const r of rows) lines.push(`| ${r.map(cell).join(' | ')} |`)
  return lines.join('\n')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成页面顶部横幅与面包屑 HTML
// 参数说明  title 横幅标题；desc 横幅说明；crumbs 面包屑文字数组
// 返回参数  HTML 文本
// 使用示例  banner('产品中心', '简介', ['首页', '产品中心'])
// 备注信息  样式见 custom.css 第 9 段
//-------------------------------------------------------------------------------------------------------------------
function banner(title, desc, crumbs) {
  return [
    '<div class="series-banner">',
    `  <h1>${html(title)}</h1>`,
    desc ? `  <p>${html(desc)}</p>` : '',
    '</div>',
    '',
    `<div class="breadcrumb">${crumbs.map(html).join(' » ')}</div>`
  ].filter((l) => l !== '').join('\n')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  写入生成的页面文件（内容相同则跳过，避免本地预览无谓刷新）
// 参数说明  rel 相对项目根目录的路径；content 文件内容
// 返回参数  无
// 使用示例  writePage('code/index.md', '# 代码下载')
// 备注信息  自动创建目录；文件头加「自动生成」提示
//-------------------------------------------------------------------------------------------------------------------
function writePage(rel, content) {
  const file = path.join(ROOT, rel)
  const note = '<!-- 本文件由 网页文字.yaml 自动生成，请勿直接修改 -->'
  // frontmatter 必须在文件最前面，所以提示注释放在它后面
  const m = content.match(/^---\n[\s\S]*?\n---\n?/)
  const final = m
    ? `${m[0].trimEnd()}\n${note}\n${content.slice(m[0].length).trim()}\n`
    : `${note}\n${content.trim()}\n`
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf-8') === final) return
  fs.writeFileSync(file, final, 'utf-8')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  删除目录中不再需要的生成页面
// 参数说明  dir 相对项目根目录的目录；keep 需保留的文件名集合
// 返回参数  无
// 使用示例  removeStale('products', new Set(['index.md', 'series-1.md']))
// 备注信息  只删除 .md 文件
//-------------------------------------------------------------------------------------------------------------------
function removeStale(dir, keep) {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) return
  for (const f of fs.readdirSync(abs)) {
    if (f.endsWith('.md') && !keep.has(f)) fs.rmSync(path.join(abs, f))
  }
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  确保下载文件夹存在（含 .gitkeep，让 Git 保留空文件夹）
// 参数说明  rel 相对 public/downloads 的路径
// 返回参数  无
// 使用示例  ensureDownloadDir('series-1/datasheet')
// 备注信息  已存在则不做任何改动
//-------------------------------------------------------------------------------------------------------------------
function ensureDownloadDir(rel) {
  const dir = path.join(ROOT, 'public', 'downloads', rel)
  if (fs.existsSync(dir)) return
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, '.gitkeep'), '')
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  根据文字总表生成全部页面文件
// 参数说明  t loadText() 的返回值
// 返回参数  无
// 使用示例  generatePages(loadText())
// 备注信息  生成 index.md、products/*.md、code/index.md、resources/index.md、support/index.md、changelog/index.md；
//           删除总表中已移除的系列页面；创建共用的设计资源下载文件夹；support/ 下的文章由人工编写，不会被改动
//-------------------------------------------------------------------------------------------------------------------
export function generatePages(t) {
  const nav = t.导航

  // 首页（frontmatter 用 YAML 库生成，避免引号、冒号等字符出错）
  const home = {
    layout: 'home',
    hero: {
      name: String(t.首页.标题),
      tagline: String(t.首页.副标题),
      actions: t.首页.按钮.map((b, i) => ({ theme: i === 0 ? 'brand' : 'alt', text: String(b.文字), link: String(b.链接) }))
    },
    // 服务导航卡片；指向更新日志且更新日志不发布时去掉
    features: t.首页.卡片
      .map((c) => ({ title: String(c.标题), details: String(c.说明), link: String(c.链接) }))
      .filter((c) => t.更新日志.已发布 || !c.link.startsWith('/changelog'))
  }
  writePage('index.md', `---\n${YAML.stringify(home)}---`)

  // 产品中心（pageClass: product-page 用于加宽内容区、收窄侧边栏，样式见 custom.css 第 14 段）
  const series = t.产品系列
  writePage('products/index.md', [
    '---\noutline: false\npageClass: product-page\n---',
    banner(t.产品中心.横幅标题, t.产品中心.横幅说明, [nav.首页, nav.产品中心]),
    `## ${t.产品中心.列表标题}`,
    table(t.产品中心.列表表头, []).split('\n').slice(0, 2).join('\n') + '\n' +
      series.map((s) => `| [${cell(s.名称)}](/products/${s.目录}) | ${cell(s.简介)} |`).join('\n')
  ].join('\n\n'))

  // 产品系列页
  const sp = t.产品系列页
  for (const s of series) {
    const buttons = sp.按钮
      .map((b, i) => {
        // 指向样片申请页的按钮自动带上当前系列名称
        const href = String(b.链接).startsWith('/sample/')
          ? `/sample/?series=${encodeURIComponent(s.名称)}`
          : b.链接
        return `  <a class="series-btn${i === 0 ? ' primary' : ''}" href="${html(href)}">${html(b.文字)}</a>`
      })
      .concat(`  <a class="series-btn" href="/products/">${html(sp.返回按钮)}</a>`)
    // 关键参数卡片与典型应用（同类网站系列页首屏的常见做法）；未填写则不显示
    const params = (s.关键参数 || []).map((k) =>
      `  <div class="kp"><div class="kp-v">${html(k.值)}</div><div class="kp-n">${html(k.名称)}</div></div>`)
    const apps = String(s.典型应用 ?? '').trim()
    writePage(`products/${s.目录}.md`, [
      '---\noutline: false\npageClass: product-page\n---',
      banner(s.名称, s.简介, [nav.首页, nav.产品中心, s.名称]),
      `<div class="series-actions">\n${buttons.join('\n')}\n</div>`,
      params.length ? `<div class="key-params">\n${params.join('\n')}\n</div>` : '',
      apps ? `<p class="series-apps"><strong>${html(sp.应用标题)}：</strong>${html(apps)}</p>` : '',
      `## ${sp.选型标题}`,
      `<SelectionTable series="${s.目录}" />`,
      `## ${sp.资料标题}`,
      `<ResourceGroups base="series" kind="series" />`
    ].filter(Boolean).join('\n\n'))
  }
  removeStale('products', new Set(['index.md', ...series.map((s) => `${s.目录}.md`)]))
  // 设计资源：三个系列共用 public/downloads/series/<资料分组文件夹>/，各系列页显示相同内容
  for (const g of sp.资料分组) ensureDownloadDir(`series/${g.文件夹}`)

  // 旧版「文档中心」生成的 docs/ 目录已停用，构建时清除
  fs.rmSync(path.join(ROOT, 'docs'), { recursive: true, force: true })

  // 开发支持首页：按分组列出文章卡片（文章本身是 support/<文件>.md，人工编写）
  const supportFile = path.join(ROOT, 'support', 'index.md')
  if (t.开发支持.已发布) {
    const cards = t.开发支持.分组.map((g) => [
      `## ${g.标题}`,
      '<div class="support-cards">',
      ...g.文章.map((p) => `  <a class="support-card" href="/support/${p.文件}"><div class="sc-title">${html(p.标题)}</div><div class="sc-desc">${html(p.说明)}</div></a>`),
      '</div>'
    ].join('\n'))
    writePage('support/index.md', [
      '---\noutline: false\npageClass: doc-page\n---',
      banner(t.开发支持.横幅标题, t.开发支持.横幅说明, [nav.首页, nav.开发支持]),
      ...cards
    ].join('\n\n'))
  } else if (fs.existsSync(supportFile)) {
    fs.rmSync(supportFile)
  }

  // 代码下载、更新日志
  ensureDownloadDir('code')
  const intro = String(t.代码下载.说明).trim()
  for (const g of t.代码下载.分组) ensureDownloadDir(`code/${g.文件夹}`)
  writePage('code/index.md', [`# ${t.代码下载.标题}`, intro, '<ResourceGroups base="code" kind="code" />'].filter(Boolean).join('\n\n'))

  // 资料下载汇总页（全部系列、全部类型的文件，可筛选、搜索；由 AllDownloads.vue 渲染）
  writePage('resources/index.md', [
    '---\noutline: false\npageClass: product-page\n---',
    banner(t.资料下载.标题, t.资料下载.说明, [nav.首页, nav.资料下载]),
    '<AllDownloads />'
  ].join('\n\n'))

  // 样片申请页（表单由 SampleForm.vue 渲染，提交到 functions/api/sample.js）
  writePage('sample/index.md', [
    '---\noutline: false\nsearch: false\n---',
    banner(t.样片申请.标题, '', [nav.首页, nav.产品中心, t.样片申请.标题]),
    '<SampleForm />'
  ].join('\n\n'))
  if (t.更新日志.已发布) {
    writePage('changelog/index.md', `# ${t.更新日志.标题}\n\n${t.更新日志.正文}`)
  } else {
    fs.rmSync(path.join(ROOT, 'changelog'), { recursive: true, force: true })
  }

}
