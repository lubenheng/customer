<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useData } from 'vitepress'

// 文字来自 网页文字.yaml「样片申请」
const { theme } = useData()
const t = theme.value.pageText.sample

const form = reactive({ series: '', company: '', contact: '', phone: '', email: '', note: '', website: '' })
const status = ref('idle') // idle | sending | ok | error
const message = ref('')

// 从产品系列页进入时，网址带 ?series=系列名，自动填入「申请产品」
onMounted(() => {
  const s = new URLSearchParams(window.location.search).get('series')
  if (s) form.series = s.slice(0, 100)
})

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  提交样片申请到 /api/sample
// 参数说明  无（读取 form）
// 返回参数  无（更新 status 和 message）
// 使用示例  <form @submit.prevent="submit">
// 备注信息  先在浏览器端校验必填项和邮箱格式；成功后清空表单（保留申请产品）
//-------------------------------------------------------------------------------------------------------------------
async function submit() {
  if (!form.company.trim() || !form.contact.trim() || !form.phone.trim() || !form.email.trim()) {
    status.value = 'error'
    message.value = t.required
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    status.value = 'error'
    message.value = t.badEmail
    return
  }
  status.value = 'sending'
  message.value = ''
  try {
    const res = await fetch('/api/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) throw new Error(data.error || res.status)
    status.value = 'ok'
    message.value = t.success
    Object.assign(form, { company: '', contact: '', phone: '', email: '', note: '' })
  } catch {
    status.value = 'error'
    message.value = t.fail
  }
}
</script>

<template>
  <form class="sample-form" novalidate @submit.prevent="submit">
    <p class="sample-intro">{{ t.intro }}</p>

    <label>
      <span>{{ t.series }}</span>
      <input v-model="form.series" maxlength="100" />
    </label>
    <label>
      <span>{{ t.company }} <em>*</em></span>
      <input v-model="form.company" maxlength="100" required autocomplete="organization" />
    </label>
    <label>
      <span>{{ t.contact }} <em>*</em></span>
      <input v-model="form.contact" maxlength="50" required autocomplete="name" />
    </label>
    <label>
      <span>{{ t.phone }} <em>*</em></span>
      <input v-model="form.phone" maxlength="30" required type="tel" autocomplete="tel" />
    </label>
    <label>
      <span>{{ t.email }} <em>*</em></span>
      <input v-model="form.email" maxlength="100" required type="email" autocomplete="email" />
    </label>
    <label>
      <span>{{ t.note }}</span>
      <textarea v-model="form.note" maxlength="2000" rows="5" :placeholder="t.notePlaceholder"></textarea>
    </label>

    <!-- 防机器人字段：对访客隐藏，正常用户不会填写 -->
    <input v-model="form.website" class="sample-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

    <button type="submit" :disabled="status === 'sending'">
      {{ status === 'sending' ? t.sending : t.submit }}
    </button>
    <p v-if="message" :class="['sample-msg', status]">{{ message }}</p>
  </form>
</template>
