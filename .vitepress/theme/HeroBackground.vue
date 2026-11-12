<script setup>
import { withBase } from 'vitepress'

// 首页横幅背景轮播：三张图叠放，依次淡入淡出（动画见 custom.css 第 3 段）
// 图片位于 public/，更换时替换同名文件即可；数量变化需同步修改 custom.css 中的动画时长与延迟
const images = ['/bg-1.jpg', '/bg-2.jpg', '/bg-3.jpg']
</script>

<template>
  <div class="hero-bg" aria-hidden="true">
    <div v-for="(src, i) in images" :key="src" class="hero-bg-img" :style="{ backgroundImage: `url(${withBase(src)})` }"></div>
  </div>
</template>
