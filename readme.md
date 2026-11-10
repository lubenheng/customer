# 上海灿瑞科技股份有限公司 文档站点

基于 VitePress 的文档站点，通过 Cloudflare Pages 部署，大文件存放于 Cloudflare R2。

- 本地预览：`npm install && npm run docs:dev`
- 构建：`npx vitepress build`（输出 `.vitepress/dist`）
- 操作指南：见 操作指南.md
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

### 2026-11-10 17:25
- 新增 操作指南.md（从本地编辑到部署、R2、排障的完整步骤）
- 界面优化：参考 lksmcu.com 的企业风格（深蓝导航、卡片、表格、页脚），样式在 .vitepress/theme/custom.css
- 站点名称改为「上海灿瑞科技股份有限公司」
- 首页横幅背景使用 orient-chip.com 官网图片（public/hero-bg.jpg）
- 内部说明文档（DEPLOY.md、R2-SETUP.md、readme.md、操作指南.md）通过 srcExclude 排除，不再发布为网页
