# Cloudflare R2 集成说明

用于存放「代码下载」页面中的大文件（zip、pdf 等），不放进 Git 仓库。

## 1. 创建 R2 桶（控制台操作顺序）

1. 登录 https://dash.cloudflare.com
2. 左侧菜单点击 **R2 Object Storage**（首次使用需按提示开通 R2，开通时需要绑定付款方式）
3. 点击 **Create bucket**
4. Bucket name 填写 `docs-files`，Location 保持 Automatic
5. 点击 **Create bucket**

## 2. 上传文件

### 方式 A：控制台上传
**R2 Object Storage → docs-files → Objects → Upload**，拖入文件即可。

### 方式 B：Wrangler 命令行

```bash
# 首次使用先登录（会打开浏览器授权）
npx wrangler login

# 上传文件到远程桶（新版 Wrangler 默认操作本地模拟存储，需加 --remote）
npx wrangler r2 object put docs-files/manual.pdf --file ./manual.pdf --remote
npx wrangler r2 object put docs-files/example.zip --file ./example.zip --remote
```

> 说明：Wrangler 4.x 起 `r2 object` 命令默认作用于本地开发存储，必须加 `--remote` 才会上传到 Cloudflare。旧版本 Wrangler 不加 `--remote` 即上传到远程。

## 3. 开启公开访问（二选一）

### 方式一：Public Development URL（r2.dev）

1. **R2 Object Storage → docs-files → Settings**
2. 找到 **Public Development URL**，点击 **Enable**，按提示输入 `allow` 确认
3. 得到形如 `https://pub-<一串字符>.r2.dev` 的地址
4. 文件访问地址：`https://pub-<一串字符>.r2.dev/example.zip`

⚠️ Cloudflare 官方说明 r2.dev 地址**仅用于测试/开发，不适合生产使用**（有速率限制，且不支持缓存等功能）。

### 方式二：绑定自定义域名（推荐用于生产）

前提：域名已托管在 Cloudflare（已添加到 Cloudflare 账号且 DNS 由 Cloudflare 管理）。

1. **R2 Object Storage → docs-files → Settings**
2. 找到 **Custom Domains**，点击 **Add**
3. 输入子域名，例如 `files.example.com`，点击 **Continue → Connect Domain**
4. 等待状态变为 **Active**
5. 文件访问地址：`https://files.example.com/example.zip`

## 4. 替换 code/index.md 中的占位链接

打开 `code/index.md`，将所有 `https://pub-xxxx.r2.dev` 替换为第 3 步得到的实际地址，例如：

```md
<!-- 替换前 -->
[example.zip](https://pub-xxxx.r2.dev/example.zip)

<!-- 替换后（r2.dev） -->
[example.zip](https://pub-1a2b3c4d.r2.dev/example.zip)

<!-- 或替换后（自定义域名） -->
[example.zip](https://files.example.com/example.zip)
```

同时确保文件名与 R2 中的对象名一致（区分大小写），替换完成后删除页面顶部的「请替换」提示块，然后 `git push`，Pages 会自动重新部署。

## 5. 国内访问提醒（如实说明）

- R2 在中国大陆直连速度不理想，电信/联通用户下载大文件体验较差（速度慢、可能中断）。
- 使用自定义域名并不能改变这一点，原因同 Pages：Cloudflare 免费/普通套餐无中国大陆节点。
- 如果客户主要在国内，建议评估：
  - 将大文件改放到国内可访问的存储（如国内云厂商对象存储，需备案域名），文档站点中直接链接该地址；或
  - 接受较慢的下载速度，并在下载页注明。
