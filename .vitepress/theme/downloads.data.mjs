import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 下载文件根目录：public/downloads（构建时扫描，结果打包进网页）
const ROOT = fileURLToPath(new URL('../../public/downloads', import.meta.url))

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  递归扫描目录，按「相对子目录」分组收集文件信息
// 参数说明  dir    当前扫描的绝对路径
//           result 输出对象，键为相对 ROOT 的目录（用 / 分隔），值为文件数组
// 返回参数  无（结果写入 result）
// 使用示例  const result = {}; scanDir(ROOT, result)
// 备注信息  跳过以 . 开头的文件和目录（如 .gitkeep）；文件按名称排序
//-------------------------------------------------------------------------------------------------------------------
function scanDir(dir, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const key = path.relative(ROOT, dir).split(path.sep).join('/')
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scanDir(full, result)
    } else {
      files.push({ name: entry.name, size: fs.statSync(full).size })
    }
  }

  files.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  result[key] = files
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  VitePress 数据加载器：构建时生成「目录 → 文件列表」映射
// 参数说明  无
// 返回参数  { 'code': [{ name, size }], 'series-1/datasheet': [...], ... }
// 使用示例  import { data } from './downloads.data.mjs'
// 备注信息  本地 dev 模式下增删文件会自动刷新；线上每次 git push 触发构建时重新扫描
//-------------------------------------------------------------------------------------------------------------------
export default {
  watch: ['../../public/downloads/**/*'],
  load() {
    const result = {}
    if (fs.existsSync(ROOT)) scanDir(ROOT, result)
    return result
  }
}
