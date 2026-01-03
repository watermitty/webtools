<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string';
import { Codemirror } from "vue-codemirror";
import '@codemirror/search';
import '@codemirror/state';
import '@codemirror/commands';
import * as prettier from "prettier/standalone";
import * as parserHtml from 'prettier/parser-html';
import { ElMessage } from 'element-plus';

const { t } = useI18n()

const info = reactive({
  code: '',
  isParseErr: false,
  parseErr: '',
})

const formatCode = async () => {
  try {
    info.code = await prettier.format(info.code, { parser: "html", plugins: [parserHtml]})
  } catch (error) {
    ElMessage({
      showClose: true,
      message: t('tools.htmlformat.error_format'),
      type: 'error',
    })
  }
}

const clear = () => {
  info.code = ''
}

const copyRes = async () => {
  copy(info.code)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.htmlformat.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">
      
      <div>
        <codemirror
          v-model="info.code"
          :placeholder="$t('tools.htmlformat.placeholder')"
          :style="{ height: '400px' }"
          :autofocus="true"
          :indent-with-tab="true" 
          :tabSize="2"
        />
      </div>
      
      <div class="mt-4">
        <el-button type="primary" @click="formatCode">{{ $t('tools.htmlformat.format') }}</el-button>
        <el-button type="primary" @click="copyRes">{{ $t('tools.htmlformat.copy') }}</el-button>
        <el-button type="primary" @click="clear">{{ $t('tools.htmlformat.clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-red-100 p-3 mb-3" v-show="info.isParseErr">
        <el-text type="danger">{{ info.parseErr }}</el-text>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.htmlformat.detail_title')">
      <el-text>
        {{ $t('tools.htmlformat.detail_content') }}
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>
</style>