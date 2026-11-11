<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// 首页「联系我们」，文字来自 网页文字.yaml「首页 → 联系我们」
const { theme } = useData()
const c = computed(() => theme.value.pageText.contact)

// 留空的项不显示
const items = computed(() =>
  [
    { key: 'address', label: c.value.addressLabel, value: c.value.address, href: '' },
    { key: 'phone', label: c.value.phoneLabel, value: c.value.phone, href: telHref(c.value.phone) },
    { key: 'email', label: c.value.emailLabel, value: c.value.email, href: mailHref(c.value.email) }
  ].filter((i) => i.value)
)

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成拨号链接
// 参数说明  phone 电话文字
// 返回参数  'tel:xxx'；内容不像电话号码（如占位文字）时返回空字符串，不加链接
// 使用示例  telHref('021-1234 5678') // 'tel:02112345678'
// 备注信息  只保留数字和 +
//-------------------------------------------------------------------------------------------------------------------
function telHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  return digits.length >= 5 ? `tel:${digits}` : ''
}

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  生成发邮件链接
// 参数说明  email 邮箱文字
// 返回参数  'mailto:xxx'；不是有效邮箱格式（如占位文字）时返回空字符串，不加链接
// 使用示例  mailHref('sales@example.com') // 'mailto:sales@example.com'
// 备注信息  无
//-------------------------------------------------------------------------------------------------------------------
function mailHref(email) {
  const e = String(email || '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? `mailto:${e}` : ''
}
</script>

<template>
  <section v-if="items.length" class="home-contact">
    <h2>{{ c.title }}</h2>
    <div class="home-contact-list">
      <div v-for="i in items" :key="i.key" class="home-contact-item">
        <div class="label">{{ i.label }}</div>
        <a v-if="i.href" class="value" :href="i.href">{{ i.value }}</a>
        <div v-else class="value">{{ i.value }}</div>
      </div>
    </div>
  </section>
</template>
