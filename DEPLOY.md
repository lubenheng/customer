# Cloudflare Pages 部署说明

## 1. 前提

- 本项目（`docs-site` 目录内容）作为仓库根目录推送到 `https://github.com/lubenheng/test`。
- 仓库根目录包含 `package.json`，Cloudflare Pages 构建时会自动执行 `npm install` 安装 VitePress。

## 2. 创建 Pages 项目（控制台操作顺序）

1. 登录 https://dash.cloudflare.com
2. 左侧菜单点击 **Workers & Pages**
3. 点击右上角 **Create application**
4. 切换到 **Pages** 标签页
5. 点击 **Import an existing Git repository**（连接到 Git）
6. 首次使用会要求连接 GitHub 账号 → 授权后在仓库列表选择 **lubenheng/test**
7. 点击 **Begin setup**，填写下方构建配置
8. 点击 **Save and Deploy**，等待首次构建完成，获得 `https://<项目名>.pages.dev` 地址

## 3. 构建配置

| 配置项 | 值 |
| --- | --- |
| Project name | 自定义，例如 `test`（决定 `*.pages.dev` 子域名） |
| Production branch | `main`（或仓库实际分支名） |
| Framework preset | `None`（或 `VitePress`，两者均可，以下面的值为准） |
| Build command | `npx vitepress build` |
| Build output directory | `.vitepress/dist` |
| Root directory | 留空（仓库根目录即 VitePress 项目根目录） |

环境变量（可选，推荐）：在 **Settings → Variables and Secrets** 中添加 `NODE_VERSION = 20`，确保构建使用 Node 20（VitePress 要求 Node 18+）。

> 如果你将 `docs-site` 作为子目录推送（而非仓库根目录），需把 **Root directory** 设为 `docs-site`，其余不变。

## 4. 自动部署

连接 Git 后，每次 `git push` 到 Production branch，Cloudflare Pages 会自动拉取并重新构建部署；推送到其他分支会生成预览部署（Preview deployment）。
可在 **Workers & Pages → 你的项目 → Deployments** 查看构建日志。

## 5. 私有仓库授权

如果 `lubenheng/test` 是私有仓库，需要确保 Cloudflare 的 GitHub App 有权访问：

1. 打开 GitHub → 右上角头像 → **Settings**
2. 左侧 **Integrations → Applications** → **Installed GitHub Apps**
3. 找到 **Cloudflare Workers and Pages**，点击 **Configure**（未安装时在第 2 节第 6 步授权流程中会引导安装）
4. 在 **Repository access** 中选择 **All repositories**，或 **Only select repositories** 并勾选 `lubenheng/test`
5. 点击 **Save**，回到 Cloudflare 刷新仓库列表

## 6. 已知限制（如实说明）

- `*.pages.dev` 默认域名在中国大陆访问可能不稳定（时快时慢，部分地区或运营商可能无法访问）。
- 原因：Cloudflare 免费层不提供中国大陆境内节点，大陆用户流量会被路由到境外节点。这是网络层面的限制，**无法通过 Pages 构建配置或站点配置解决**。
- 绑定自定义域名（**项目 → Custom domains**）可以避免使用 `pages.dev` 域名，但流量仍走境外节点，同样不能保证大陆访问质量。
