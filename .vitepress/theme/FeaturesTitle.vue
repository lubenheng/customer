<script setup>
import { useData } from 'vitepress'

// 首页卡片区标题，文字来自 网页文字.yaml「首页 → 卡片区标题」
const { theme } = useData()
</script>

<template>
  <div class="features-title">{{ theme.pageText.featuresTitle }}</div>
</template>
