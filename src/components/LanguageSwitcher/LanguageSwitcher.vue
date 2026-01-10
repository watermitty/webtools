<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElSelect, ElOption } from 'element-plus'

const langs = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

onMounted(() => {
  console.log('LanguageSwitcher mounted', selected.value)
})

const selected = ref(localStorage.getItem('locale') || (navigator.language.startsWith('zh') ? 'zh' : 'en'))

function change(lang: string) {
  localStorage.setItem('locale', lang)
  // simplest approach: reload to let ElementPlus locale and other libs re-init
  location.reload()
}
</script>

<template>
  <el-select v-model="selected" size="small" @change="change" class="w-28">
    <el-option v-for="l in langs" :key="l.value" :label="l.label" :value="l.value" />
  </el-select>
</template>

<style scoped>
.w-28 { width: 7rem; }
</style>
