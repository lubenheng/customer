# 我的技术文档中心

基于 VitePress 的文档站点，通过 Cloudflare Pages 部署，大文件存放于 Cloudflare R2。

- 本地预览：`npm install && npm run docs:dev`
- 构建：`npx vitepress build`（输出 `.vitepress/dist`）
- 部署说明：见 DEPLOY.md
- R2 集成：见 R2-SETUP.md

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
