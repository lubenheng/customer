<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from './downloads.data.mjs'
import { fileUrl, formatSize } from './downloadUtils.mjs'

// 首页「最新资料」：按更新日期取最新的 N 份文件（N 来自 网页文字.yaml「首页 → 最新资料数量」，0 不显示）
const { theme } = useData()
const pt = computed(() => theme.value.pageText)
const h = computed(() => pt.value.home)

const latest = computed(() => {
  const list = []
  for (const g of pt.value.groups.series) {
    for (const f of data[`series/${g.folder}`] || []) list.push({ ...f, dir: `series/${g.folder}`, tag: g.name })
  }
  for (const g of pt.value.groups.code) {
    for (const f of data[`code/${g.folder}`] || []) list.push({ ...f, dir: `code/${g.folder}`, tag: `${pt.value.resources.code} · ${g.name}` })
  }
  return list
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, h.value.latestCount)
})
</script>

<template>
  <section v-if="h.latestCount > 0 && latest.length" class="home-latest">
    <h2 class="home-sec-title">{{ h.latestTitle }}</h2>
    <ul class="home-latest-list">
      <li v-for="f in latest" :key="f.dir + '/' + f.name">
        <a class="hl-name" :href="fileUrl(f.dir, f.name)" target="_blank" rel="noopener">{{ f.desc || f.name }}</a>
        <span class="hl-tag">{{ f.tag }}</span>
        <span class="hl-meta">{{ [f.version, f.date, formatSize(f.size)].filter(Boolean).join(' · ') }}</span>
      </li>
    </ul>
    <div class="home-latest-more"><a :href="withBase('/resources/')">{{ h.viewAll }}</a></div>
  </section>
</template>
