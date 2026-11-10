# 上海灿瑞科技股份有限公司 文档站点

基于 VitePress 的文档站点，通过 Cloudflare Pages 部署，下载文件放在 public/downloads/ 随站点一起发布。

- 网站地址：https://customer-14k.pages.dev（推送到 main 后自动更新）
- 本地预览：`npm install && npm run docs:dev`
- 构建：`npx vitepress build`（输出 `.vitepress/dist`）
- 操作指南：见 操作指南.md
- 部署说明：见 DEPLOY.md

创作者：pjh-AI

## 修改记录

### 2026-11-10 16:42
- 初始化 VitePress 项目：站点配置（导航、侧边栏、本地搜索）
- 新增页面：首页、快速开始、用户手册、应用笔记、代码下载、更新日志
- 新增 DEPLOY.md（Cloudflare Pages 部署说明）、R2-SETUP.md（R2 集成说明）
- 本地构建验证通过

### 2026-11-10 16:59
- 目标仓库由 lubenheng/test（已有无关项目）改为空仓库 lubenheng/customer
- DEPLOY.md 中的仓库名同步更新

### 2026-11-10 17:25
- 新增 操作指南.md（从本地编辑到部署、R2、排障的完整步骤）
- 界面优化：参考 lksmcu.com 的企业风格（深蓝导航、卡片、表格、页脚），样式在 .vitepress/theme/custom.css
- 站点名称改为「上海灿瑞科技股份有限公司」
- 首页横幅背景使用 orient-chip.com 官网图片（public/hero-bg.jpg）
- 内部说明文档（DEPLOY.md、R2-SETUP.md、readme.md、操作指南.md）通过 srcExclude 排除，不再发布为网页

### 2026-11-10 18:05
- 新增「产品中心」（/products/）及 3 个产品系列占位页（series-1/2/3），布局参考 lksmcu.com LKS03 系列页：横幅、面包屑、操作按钮、产品选型表、7 类设计资源折叠
- 顶部导航新增「产品中心」，产品页侧边栏列出各系列
- custom.css 新增第 9 段产品系列页样式

### 2026-11-10 19:29
- 不再使用 Cloudflare R2：删除 R2-SETUP.md，下载文件改放 public/downloads/（单文件上限 25 MB）
- code/index.md 下载链接改为 /downloads/xxx，删除「请替换」提示
- 操作指南.md 第五节改为「下载文件管理」，同步更新速查与排障表
- DEPLOY.md 中项目名示例由 test 改为 customer

### 2026-11-10 19:46
- Cloudflare Pages 已连接 lubenheng/customer，网站上线：https://customer-14k.pages.dev
- 推送到 main 自动构建部署；线上检查 10 个公开页面均正常，内部文档均为 404
- readme.md、操作指南.md 记录实际网站地址

### 2026-11-10 19:59
- 下载列表自动化：网页自动列出 public/downloads/ 下对应文件夹中的文件（文件名、大小、下载按钮），无需改页面
  - .vitepress/theme/downloads.data.mjs：构建时扫描文件夹
  - .vitepress/theme/DownloadList.vue：下载列表组件，页面中写 `<DownloadList dir="文件夹" />`
- 新建文件夹：code/ 对应代码下载页；series-1~3/ 下 7 个子文件夹对应各系列设计资源分组
- code/index.md 与 3 个系列页改用自动列表，空文件夹显示「暂无资料」
- 操作指南.md 第五节新增文件夹与网页位置对应表
