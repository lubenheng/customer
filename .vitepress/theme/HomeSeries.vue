<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

// 首页产品系列卡片：名称、简介、关键参数前 3 项，点击进入系列页；文字来自 网页文字.yaml「首页」「产品系列」
const { theme } = useData()
const h = computed(() => theme.value.pageText.home)
</script>

<template>
  <section v-if="h.series.length" class="home-series">
    <h2 class="home-sec-title">{{ h.seriesTitle }}</h2>
    <div class="home-series-list">
      <a v-for="s in h.series" :key="s.dir" class="home-series-card" :href="withBase(`/products/${s.dir}`)">
        <div class="hs-name">{{ s.name }}</div>
        <div v-if="s.params.length" class="hs-params">
          <div v-for="p in s.params" :key="p.name" class="hs-param">
            <div class="hs-v">{{ p.value }}</div>
            <div class="hs-n">{{ p.name }}</div>
          </div>
        </div>
        <p class="hs-intro">{{ s.intro }}</p>
        <span class="hs-more">{{ h.seriesMore }} →</span>
      </a>
    </div>
  </section>
</template>
