import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

// 下载文件根目录：public/downloads（构建时扫描，结果打包进网页）
const ROOT = fileURLToPath(new URL('../../public/downloads', import.meta.url))
// 每个文件夹中的文件说明表（说明、版本、更新日期），不作为下载文件显示
export const META_FILE = '文件说明.yaml'

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  读取文件夹中的「文件说明.yaml」
// 参数说明  dir 文件夹绝对路径
// 返回参数  { 文件名: { desc, version, date } }；没有说明表时返回空对象
// 使用示例  const meta = readMeta('C:/.../public/downloads/series-1/user-manual')
// 备注信息  使用 failsafe 模式解析，所有值都按文字处理（避免「1.0」被当成数字 1）；
//           格式错误时抛出带文件路径的中文错误，构建中止
//-------------------------------------------------------------------------------------------------------------------
function readMeta(dir) {
  const file = path.join(dir, META_FILE)
  if (!fs.existsSync(file)) return {}
  const rel = path.relative(path.join(ROOT, '..', '..'), file).split(path.sep).join('/')
  const doc = YAML.parseDocument(fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, ''), { schema: 'failsafe' })
  if (doc.errors.length) throw new Error(`[${rel}] 格式错误：\n${doc.errors.map((e) => e.message).join('\n')}`)
  const raw = doc.toJS() || {}
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`[${rel}] 格式错误：应为「文件名:」开头的分组`)

  const meta = {}
  for (const [name, v] of Object.entries(raw)) {
    if (!v || typeof v !== 'object') throw new Error(`[${rel}] 「${name}」下应包含 说明/版本/更新日期`)
    meta[name] = {
      desc: String(v.说明 ?? '').trim(),
      version: String(v.版本 ?? '').trim(),
      date: String(v.更新日期 ?? '').trim()
    }
  }
  return meta
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  递归扫描目录，按「相对子目录」分组收集文件信息
// 参数说明  dir    当前扫描的绝对路径
//           result 输出对象，键为相对 ROOT 的目录（用 / 分隔），值为文件数组
// 返回参数  无（结果写入 result）
// 使用示例  const result = {}; scanDir(ROOT, result)
// 备注信息  跳过以 . 开头的文件和目录（如 .gitkeep）及 文件说明.yaml；文件按名称排序；
//           说明表中写了但文件夹里不存在的文件名，在终端给出提示（多为文件名写错）
//-------------------------------------------------------------------------------------------------------------------
function scanDir(dir, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const key = path.relative(ROOT, dir).split(path.sep).join('/')
  const meta = readMeta(dir)
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === META_FILE) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scanDir(full, result)
    } else {
      const m = meta[entry.name] || {}
      files.push({
        name: entry.name,
        size: fs.statSync(full).size,
        desc: m.desc || '',
        version: m.version || '',
        date: m.date || ''
      })
    }
  }

  for (const name of Object.keys(meta)) {
    if (!files.some((f) => f.name === name)) {
      console.warn(`[文件说明] ${key}/${META_FILE} 中的「${name}」在文件夹中不存在，请检查文件名是否一致`)
    }
  }

  files.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  result[key] = files
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  VitePress 数据加载器：构建时生成「目录 → 文件列表」映射
// 参数说明  无
// 返回参数  { 'code/examples': [{ name, size, desc, version, date }], 'series-1/datasheet': [...], ... }
// 使用示例  import { data } from './downloads.data.mjs'
// 备注信息  本地 dev 模式下增删文件、修改 文件说明.yaml 会自动刷新；线上每次 git push 触发构建时重新扫描
//-------------------------------------------------------------------------------------------------------------------
export default {
  watch: ['../../public/downloads/**/*'],
  load() {
    const result = {}
    if (fs.existsSync(ROOT)) scanDir(ROOT, result)
    return result
  }
}
