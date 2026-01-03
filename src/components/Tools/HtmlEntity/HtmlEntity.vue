<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { escape, unescape } from 'lodash';
import { copy } from '@/utils/string'

const { t } = useI18n()

const content = ref('')
const cleanContent = ref('')

const parser = (type: string) => {
  if (type == 'toHTML') {
    cleanContent.value = unescape(content.value)
  } else {
    cleanContent.value = escape(content.value)
  }
}

const clear = () => {
  content.value = ''
  cleanContent.value = ''
}

const exampleRaw = '<div class="note">Tom & Jerry > Mickey & Minnie © 2025</div>'
const exampleEntity = escape(exampleRaw)
const fillRaw = () => { content.value = exampleRaw; cleanContent.value = '' }
const fillEntity = () => { content.value = exampleEntity; cleanContent.value = '' }

onMounted(() => {
})

</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.htmlentity.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">
      <!-- 输入区 -->
      <div class="mb-2 text-gray-500 text-sm">
        {{ $t('tools.htmlentity.input_hint') }}
        <el-link type="primary" class="ml-2" @click="copy(content)">{{ $t('tools.htmlentity.copy_input') }}</el-link>
      </div>
      <div class="mb-1 text-xs text-gray-500 break-all">
        {{ $t('tools.htmlentity.example') }}：{{ exampleRaw }}
        <el-link type="primary" class="ml-2" @click="fillRaw">{{ $t('tools.htmlentity.fill_html') }}</el-link>
        <el-divider direction="vertical" />
        {{ $t('tools.htmlentity.entity_example') }}：{{ exampleEntity }}
        <el-link type="primary" class="ml-2" @click="fillEntity">{{ $t('tools.htmlentity.fill_entity') }}</el-link>
      </div>
      <el-input
        v-model="content"
        :rows="10"
        type="textarea"
        :placeholder="$t('tools.htmlentity.placeholder')"
        @change="parser"
      />
        <div class="mt-3">
          <el-button type="primary" @click="parser('toEntity')">{{ $t('tools.htmlentity.btn_to_entity') }}</el-button>
          <el-button type="primary" @click="parser('toHTML')">{{ $t('tools.htmlentity.btn_to_html') }}</el-button>
          <el-button type="primary" @click="copy(cleanContent)">{{ $t('tools.htmlentity.btn_copy') }}</el-button>
          <el-button type="primary" @click="clear">{{ $t('tools.htmlentity.btn_clear') }}</el-button>
        </div>
      </div>

      <!-- 结果区 -->
      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <div class="mb-2 text-gray-500 text-sm">
          {{ $t('tools.htmlentity.result_title') }}
          <el-link type="primary" class="ml-2" @click="copy(cleanContent)">{{ $t('tools.htmlentity.copy_result') }}</el-link>
        </div>
        <el-input
          v-html="cleanContent"
          v-model="cleanContent"
          :rows="10"
          type="textarea"
        />
      </div>

      <!-- desc -->
      <ToolDetail :title="$t('tools.htmlentity.usage')">
        <div class="text-sm leading-7">
          <p class="font-bold">{{ $t('tools.htmlentity.usage') }}</p>
          <p>{{ $t('tools.htmlentity.usage_1') }}</p>
          <p>{{ $t('tools.htmlentity.usage_2') }}</p>
          <br>
          <p class="font-bold">{{ $t('tools.htmlentity.common_mapping') }}</p>
          <ul class="list-disc ml-5">
            <li><code>&lt;</code> → <code>&amp;lt;</code></li>
            <li><code>&gt;</code> → <code>&amp;gt;</code></li>
            <li><code>&amp;</code> → <code>&amp;amp;</code></li>
            <li><code>"</code> → <code>&amp;quot;</code></li>
            <li><code>'</code> → <code>&amp;#39;</code></li>
          </ul>
        </div>
      </ToolDetail>
  </div>
</template>

<style scoped>

</style>