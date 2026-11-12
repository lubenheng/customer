<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data } from './downloads.data.mjs'
import DownloadList from './DownloadList.vue'

// base：下载目录前缀（如 series-1、code）；kind：分组定义来源（series 产品系列页 / code 代码下载）
const props = defineProps({
  base: { type: String, required: true },
  kind: { type: String, default: 'series' }
})
const { theme } = useData()

// 显示全部分组（含空分组），标题带文件数量；有文件的分组默认展开，空分组折叠，展开后显示「暂无资料」
const groups = computed(() =>
  (theme.value.pageText.groups[props.kind] || [])
    .map((g) => ({ ...g, dir: `${props.base}/${g.folder}`, count: (data[`${props.base}/${g.folder}`] || []).length }))
)
</script>

<template>
  <details v-for="g in groups" :key="g.dir" class="details custom-block res-group" :open="g.count > 0">
    <summary>{{ g.name }} <span class="res-count">({{ g.count }})</span></summary>
    <DownloadList :dir="g.dir" />
  </details>
</template>
