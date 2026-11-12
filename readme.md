# OCS电机控制MCU 文档站点

基于 VitePress 的文档站点，通过 Cloudflare Pages 部署，下载文件放在 public/downloads/ 随站点一起发布。

- 网站地址：https://customer-document-v1.pages.dev（推送到 main 后自动更新）
- GitHub 仓库：https://github.com/OCS-MCU-Product/customer_document_v1
- **修改网页文字：只改 网页文字.yaml**（页面文件由它自动生成，直接改会被覆盖）
- 本地预览：`npm install && npm run docs:dev`
- 构建：`npx vitepress build`（输出 `.vitepress/dist`）
- 操作指南：见 操作指南.md
- 部署说明：见 DEPLOY.md
