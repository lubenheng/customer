<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data } from './downloads.data.mjs'

// dir：public/downloads 下的子目录，例如 "code"、"series-1/datasheet"
const props = defineProps({ dir: { type: String, required: true } })

const files = computed(() => data[props.dir] || [])

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成文件下载地址
// 参数说明  name 文件名
// 返回参数  站内绝对路径，如 /downloads/code/demo.zip
// 使用示例  fileUrl('demo.zip')
// 备注信息  文件名做 URL 编码，支持中文和空格
//-------------------------------------------------------------------------------------------------------------------
function fileUrl(name) {
  const dirPart = props.dir.split('/').map(encodeURIComponent).join('/')
  return withBase(`/downloads/${dirPart}/${encodeURIComponent(name)}`)
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  字节数转为易读的大小字符串
// 参数说明  bytes 文件字节数
// 返回参数  如 "512 B"、"1.2 KB"、"3.4 MB"
// 使用示例  formatSize(1536) // "1.5 KB"
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <table v-if="files.length" class="download-list">
    <thead>
      <tr><th>文件名</th><th>大小</th><th>下载</th></tr>
    </thead>
    <tbody>
      <tr v-for="f in files" :key="f.name">
        <td>{{ f.name }}</td>
        <td>{{ formatSize(f.size) }}</td>
        <td><a :href="fileUrl(f.name)" download target="_blank" rel="noopener">下载</a></td>
      </tr>
    </tbody>
  </table>
  <p v-else class="download-empty">暂无资料。</p>
</template>
