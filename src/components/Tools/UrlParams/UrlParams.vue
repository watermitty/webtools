<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'



type Row = { key: string; value: string }

const info = reactive({
  title: 'tools.urlparams.title',
})

const state = reactive({
  raw: '',
  base: '',
  autoEncode: true,
  resultQuery: '',
  resultFull: '',
})

const rows = ref<Row[]>([{ key: '', value: '' }])

const enc = (s: string) => (state.autoEncode ? encodeURIComponent(s) : s)

const parse = () => {
  let s = (state.raw || '').trim()
  // 去掉 hash
  const hashIdx = s.indexOf('#')
  if (hashIdx >= 0) s = s.slice(0, hashIdx)

  let base = ''
  let qs = s
  const qIdx = s.indexOf('?')
  if (qIdx >= 0) {
    base = s.slice(0, qIdx)
    qs = s.slice(qIdx + 1)
  }
  if (qs.startsWith('?')) qs = qs.slice(1)

  state.base = base

  if (!qs) {
    rows.value = [{ key: '', value: '' }]
    build()
    return
  }

  // 仅替换 parse 内的解析段（保留前面的 base/qs 提取）
  // 原来：
  // const segs = qs.split('&').filter(Boolean)
  // const next: Row[] = segs.map(seg => {
  //   const eq = seg.indexOf('=')
  //   if (eq === -1) return { key: dec(seg), value: '' }
  //   const k = seg.slice(0, eq)
  //   const v = seg.slice(eq + 1)
  //   return { key: dec(k), value: dec(v) }
  // })

  // 替换为：
  const sp = new URLSearchParams(qs)
  const next: Row[] = []
  sp.forEach((value, key) => {
    next.push({ key, value })
  })
  rows.value = next.length ? next : [{ key: '', value: '' }]
  build()
}

const build = () => {
  const segs = rows.value
    .filter(r => r.key !== '')
    .map(r => `${enc(r.key)}=${enc(r.value ?? '')}`)
  const qs = segs.join('&')
  state.resultQuery = qs ? `?${qs}` : ''
  state.resultFull = state.base ? `${state.base}${state.resultQuery}` : state.resultQuery
}

const addRow = () => rows.value.push({ key: '', value: '' })
const removeRow = (idx: number) => rows.value.splice(idx, 1)

const clearAll = () => {
  state.raw = ''
  state.base = ''
  state.resultQuery = ''
  state.resultFull = ''
  rows.value = [{ key: '', value: '' }]
}

const copyQuery = () => copy(state.resultQuery)
const copyFull = () => copy(state.resultFull)

const fillExample = () => {
  state.raw = 'https://example.com/path?a=1&b=2&name=%E5%BC%A0%E4%B8%89%20Lee&empty=&flag'
}

watch(rows, build, { deep: true })
watch(() => state.autoEncode, build)
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div class="mb-2 text-sm text-gray-500">
        {{ $t('tools.urlparams.intro') }}
        <el-link class="ml-2" type="primary" @click="fillExample">{{ $t('tools.urlparams.link_example') }}</el-link>
      </div>
      <el-input
        type="textarea"
        :rows="3"
        v-model="state.raw"
        :placeholder="$t('tools.urlparams.placeholder_input')"
      />

      <div class="mt-3 flex flex-wrap items-center gap-2 button-container">
        <el-button type="primary" @click="parse">{{ $t('tools.urlparams.btn_parse') }}</el-button>
        <el-button @click="build">{{ $t('tools.urlparams.btn_build') }}</el-button>
        <el-switch
          v-model="state.autoEncode"
          :active-text="$t('tools.urlparams.label_auto_encode')"
          :inactive-text="$t('tools.urlparams.label_raw')"
        />
        <el-button type="danger" @click="clearAll">{{ $t('tools.urlparams.btn_clear') }}</el-button>
      </div>

      <div class="mt-4">
        <div class="text-sm text-gray-600 mb-2">{{ $t('tools.urlparams.label_base_url') }}</div>
        <el-input v-model="state.base" :placeholder="$t('tools.urlparams.placeholder_base')" />
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm text-gray-600">{{ $t('tools.urlparams.label_params') }}</div>
          <el-button size="small" @click="addRow">{{ $t('tools.urlparams.btn_add') }}</el-button>
        </div>

        <div class="space-y-2">
          <div v-for="(r, idx) in rows" :key="idx" class="flex gap-2 items-center">
            <div class="shrink basis-[28%] md:basis-[22%] lg:basis-[18%]">
              <el-input v-model="r.key" :placeholder="$t('tools.urlparams.placeholder_key')" />
            </div>
            <div class="grow basis-0 min-w-0">
              <el-input v-model="r.value" :placeholder="$t('tools.urlparams.placeholder_value')" />
            </div>
            <el-button type="danger" link @click="removeRow(idx)">{{ $t('tools.urlparams.btn_delete') }}</el-button>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="text-sm text-gray-600 mb-1">{{ $t('tools.urlparams.label_result_query') }}</div>
        <el-input v-model="state.resultQuery" readonly />
        <div class="mt-2">
          <el-button type="primary" @click="copyQuery">{{ $t('tools.urlparams.btn_copy_query') }}</el-button>
        </div>
      </div>

      <div class="mt-4">
        <div class="text-sm text-gray-600 mb-1">{{ $t('tools.urlparams.label_result_full') }}</div>
        <el-input v-model="state.resultFull" readonly />
        <div class="mt-2">
          <el-button type="primary" @click="copyFull">{{ $t('tools.urlparams.btn_copy_full') }}</el-button>
        </div>
      </div>
    </div>

    <ToolDetail :title="$t('tools.urlparams.detail_title')">
      <el-text>
        {{ $t('tools.urlparams.detail_content') }}
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.button-container .el-button {
  margin-right: 12px;
  margin-left: 0px;
}
</style>