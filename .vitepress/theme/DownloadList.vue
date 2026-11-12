<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data } from './downloads.data.mjs'
import { fileUrl, formatSize } from './downloadUtils.mjs'

// dir：public/downloads 下的子目录，例如 "code/examples"、"series-1/datasheet"
const props = defineProps({ dir: { type: String, required: true } })

const files = computed(() => data[props.dir] || [])
// 表头等文字来自 网页文字.yaml「下载列表」
const { theme } = useData()
const text = computed(() => theme.value.pageText.download)
</script>

<template>
  <table v-if="files.length" class="download-list">
    <thead>
      <tr>
        <th>{{ text.name }}</th>
        <th>{{ text.desc }}</th>
        <th>{{ text.version }}</th>
        <th>{{ text.date }}</th>
        <th>{{ text.size }}</th>
        <th>{{ text.action }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="f in files" :key="f.name">
        <td class="dl-name">{{ f.name }}</td>
        <td class="dl-desc">{{ f.desc || '—' }}</td>
        <td class="dl-nowrap">{{ f.version || '—' }}</td>
        <td class="dl-nowrap">{{ f.date || '—' }}</td>
        <td class="dl-nowrap">{{ formatSize(f.size) }}</td>
        <td class="dl-nowrap"><a :href="fileUrl(dir, f.name)" download target="_blank" rel="noopener">{{ text.action }}</a></td>
      </tr>
    </tbody>
  </table>
  <p v-else class="download-empty">{{ text.empty }}</p>
</template>
