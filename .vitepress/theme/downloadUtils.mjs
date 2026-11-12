import { withBase } from 'vitepress'

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成文件下载地址
// 参数说明  dir public/downloads 下的子目录；name 文件名
// 返回参数  站内绝对路径，如 /downloads/code/examples/demo.zip
// 使用示例  fileUrl('code/examples', 'demo.zip')
// 备注信息  目录和文件名做 URL 编码，支持中文和空格
//-------------------------------------------------------------------------------------------------------------------
export function fileUrl(dir, name) {
  const dirPart = dir.split('/').map(encodeURIComponent).join('/')
  return withBase(`/downloads/${dirPart}/${encodeURIComponent(name)}`)
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  字节数转为易读的大小字符串
// 参数说明  bytes 文件字节数
// 返回参数  如 "512 B"、"1.2 KB"、"3.4 MB"
// 使用示例  formatSize(1536) // "1.5 KB"
//-------------------------------------------------------------------------------------------------------------------
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

