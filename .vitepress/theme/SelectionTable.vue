<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

// series：产品系列目录（如 series-1）；数据来自 网页文字.yaml「产品系列 → 选型表」
const props = defineProps({ series: { type: String, required: true } })
const { theme } = useData()
const sel = computed(() => theme.value.pageText.selection)

const keyword = ref('')
const sortCol = ref(-1)
const sortAsc = ref(true)

// 判断格子是否为空白（「—」「-」或空）
const isBlank = (v) => ['', '—', '-', '–'].includes(String(v).trim())

const rows = computed(() => sel.value.series[props.series] || [])

// 整列都为空白的列不显示（首列型号始终显示）
const cols = computed(() =>
  sel.value.head
    .map((h, i) => ({ ...h, i }))
    .filter((c) => c.i === 0 || rows.value.some((r) => !isBlank(r[c.i])))
)

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  比较两个单元格（数字按数值，其余按文字）
// 参数说明  a b 单元格文字
// 返回参数  比较结果（负数 / 0 / 正数）
// 使用示例  cmp('96', '48') // > 0
// 备注信息  空白格总排在最后
//-------------------------------------------------------------------------------------------------------------------
function cmp(a, b) {
  if (isBlank(a) !== isBlank(b)) return isBlank(a) ? 1 : -1
  const na = parseFloat(a)
  const nb = parseFloat(b)
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb
  return String(a).localeCompare(String(b), 'zh-CN')
}

// 关键字筛选（空格分隔多个关键字，须全部命中）+ 点击表头排序
const shown = computed(() => {
  const words = keyword.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  let list = rows.value.filter((r) => {
    const text = r.join(' ').toLowerCase()
    return words.every((w) => text.includes(w))
  })
  if (sortCol.value >= 0) {
    const c = sortCol.value
    list = [...list].sort((x, y) => {
      if (isBlank(x[c]) !== isBlank(y[c])) return isBlank(x[c]) ? 1 : -1
      return (sortAsc.value ? 1 : -1) * cmp(x[c], y[c])
    })
  }
  return list
})

//-------------------------------------------------------------------------------------------------------------------
// 函数简介  点击表头切换排序：升序 → 降序 → 取消
// 参数说明  i 列序号
// 返回参数  无
// 使用示例  <th @click="toggleSort(2)">
//-------------------------------------------------------------------------------------------------------------------
function toggleSort(i) {
  if (sortCol.value !== i) {
    sortCol.value = i
    sortAsc.value = true
  } else if (sortAsc.value) {
    sortAsc.value = false
  } else {
    sortCol.value = -1
  }
}

const arrow = (i) => (sortCol.value !== i ? '' : sortAsc.value ? ' ▲' : ' ▼')
</script>

<template>
  <div class="sel-tools" v-if="rows.length > 1">
    <input v-model="keyword" class="sel-filter" type="search" :placeholder="sel.filter" />
    <span class="sel-count">{{ shown.length }} / {{ rows.length }}</span>
  </div>
  <div class="selection-table">
    <table>
      <thead>
        <tr>
          <th v-for="c in cols" :key="c.i" class="sortable" @click="toggleSort(c.i)">
            <div class="th-cn">{{ c.cn }}{{ arrow(c.i) }}</div>
            <div v-if="c.en" class="th-en">{{ c.en }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in shown" :key="r[0]">
          <td v-for="c in cols" :key="c.i">{{ r[c.i] }}</td>
        </tr>
        <tr v-if="!shown.length">
          <td :colspan="cols.length" class="sel-empty">{{ sel.noMatch }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
