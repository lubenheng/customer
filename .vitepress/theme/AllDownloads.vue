<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { data } from './downloads.data.mjs'
import { fileUrl, formatSize } from './downloadUtils.mjs'

// 资料下载汇总页：列出全部系列、全部类型的文件，可按系列、类型筛选及关键字搜索
const { theme } = useData()
const pt = computed(() => theme.value.pageText)
const r = computed(() => pt.value.resources)
const text = computed(() => pt.value.download)

const fSeries = ref('')
const fType = ref('')
const keyword = ref('')

// 汇总全部文件：设计资源（三个系列共用 series/<分组>）加上代码下载分组
const all = computed(() => {
  const list = []
  for (const g of pt.value.groups.series) {
    for (const f of data[`series/${g.folder}`] || []) {
      list.push({ ...f, dir: `series/${g.folder}`, series: r.value.product, type: g.name })
    }
  }
  for (const g of pt.value.groups.code) {
    for (const f of data[`code/${g.folder}`] || []) {
      list.push({ ...f, dir: `code/${g.folder}`, series: r.value.code, type: g.name })
    }
  }
  return list
})

// 筛选项只列出有文件的系列和类型
const seriesOptions = computed(() => [...new Set(all.value.map((f) => f.series))])
const typeOptions = computed(() => [...new Set(all.value.map((f) => f.type))])

// 先按更新日期（新的在前），再按系列、文件名
const shown = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return all.value
    .filter((f) => !fSeries.value || f.series === fSeries.value)
    .filter((f) => !fType.value || f.type === fType.value)
    .filter((f) => !k || `${f.name} ${f.desc}`.toLowerCase().includes(k))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.series.localeCompare(b.series, 'zh-CN') || a.name.localeCompare(b.name, 'zh-CN'))
})
</script>

<template>
  <div class="all-dl-tools">
    <select v-model="fSeries">
      <option value="">{{ r.allSeries }}</option>
      <option v-for="s in seriesOptions" :key="s" :value="s">{{ s }}</option>
    </select>
    <select v-model="fType">
      <option value="">{{ r.allTypes }}</option>
      <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
    </select>
    <input v-model="keyword" type="search" :placeholder="r.search" />
    <span class="sel-count">{{ shown.length }} / {{ all.length }}</span>
  </div>
  <table v-if="shown.length" class="download-list">
    <thead>
      <tr>
        <th>{{ text.name }}</th>
        <th>{{ r.series }}</th>
        <th>{{ r.type }}</th>
        <th>{{ text.desc }}</th>
        <th>{{ text.version }}</th>
        <th>{{ text.date }}</th>
        <th>{{ text.size }}</th>
        <th>{{ text.action }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="f in shown" :key="f.dir + '/' + f.name">
        <td class="dl-name">{{ f.name }}</td>
        <td class="dl-nowrap">{{ f.series }}</td>
        <td class="dl-nowrap">{{ f.type }}</td>
        <td class="dl-desc">{{ f.desc || '—' }}</td>
        <td class="dl-nowrap">{{ f.version || '—' }}</td>
        <td class="dl-nowrap">{{ f.date || '—' }}</td>
        <td class="dl-nowrap">{{ formatSize(f.size) }}</td>
        <td class="dl-nowrap"><a :href="fileUrl(f.dir, f.name)" download target="_blank" rel="noopener">{{ text.action }}</a></td>
      </tr>
    </tbody>
  </table>
  <p v-else class="download-empty">{{ all.length ? r.noMatch : text.empty }}</p>
</template>
