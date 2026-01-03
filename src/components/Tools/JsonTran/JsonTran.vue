<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { transferred, copy } from '@/utils/string';
import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/javascript/javascript.js";

const { t } = useI18n()

const info = reactive({
  title: "tools.jsontran.title",
  code: '',
  isParseErr: false,
  parseErr: ''
})

const cmOptions = {
  mode: "application/json",
  lineNumbers: true,
  theme: "default",
  indentUnit: 2,
  tabSize: 2,
  lineWrapping: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
}

//格式化json
const formatJson = () => {
  try {
    //初始化错误信息
    info.isParseErr = false;
    info.parseErr = ''
    // 1、JSON.parse：把JSON字符串转换为JSON对象
    // 2、JSON.stringify：把JSON对象 转换为 有缩进的 JSON字符串格式
    info.code = JSON.stringify(JSON.parse(info.code), null, '\t');
  } catch(error) {
    info.isParseErr = true;
    info.parseErr = t('tools.jsontran.invalid_json')
  }
}

//压缩
const compress = () => {
  info.code = info.code.replace(/[\r\n\t]/g, "")
}

//转义
const tran = () => {
  info.code = transferred(info.code, "\"")
}

//去转义
const unTransferred = () => {
  info.code = info.code.replace(/[\\]/g, ``)
}

//清空输入框
const clear = () => {
  info.code = ''
}

const copyRes = async () => {
  copy(info.code)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.jsontran.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      
      <div>
        <Codemirror
          v-model:value="info.code"
          :options="cmOptions"
          border
          height="400"
          width="100%"
          :placeholder="$t('tools.jsontran.placeholder')"
        />
      </div>
      
      <div class="mt-4">
        <el-button type="primary" @click="formatJson">{{ $t('tools.jsontran.btn_format') }}</el-button>
        <el-button type="primary" @click="compress">{{ $t('tools.jsontran.btn_compress') }}</el-button>
        <el-button type="primary" @click="tran">{{ $t('tools.jsontran.btn_escape') }}</el-button>
        <el-button type="primary" @click="unTransferred">{{ $t('tools.jsontran.btn_unescape') }}</el-button>
        <el-button type="primary" @click="copyRes">{{ $t('tools.jsontran.btn_copy') }}</el-button>
        <el-button type="primary" @click="clear">{{ $t('tools.jsontran.btn_clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-red-100 p-3 mb-3" v-show="info.isParseErr">
        <el-text type="danger">{{ info.parseErr }}</el-text>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.jsontran.detail_title')">
      <div class="text-gray-600 leading-7">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.jsontran.what_is') }}</h3>
        <p class="mb-4">
          {{ $t('tools.jsontran.what_is_content') }}
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.jsontran.syntax') }}</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>{{ $t('tools.jsontran.syntax_obj') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.syntax_arr') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.syntax_key') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.syntax_value') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.syntax_str') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.syntax_comma') }}</strong></li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.jsontran.features') }}</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>{{ $t('tools.jsontran.feature_format') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.feature_compress') }}</strong></li>
          <li><strong>{{ $t('tools.jsontran.feature_escape') }}</strong></li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.jsontran.error_check') }}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsontran.error_squote') }}</h4>
            <p>错误：<code>{'id': 1}</code> <br> 正确：<code>{"id": 1}</code></p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsontran.error_noquote') }}</h4>
            <p>错误：<code>{id: 1}</code> <br> 正确：<code>{"id": 1}</code></p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.jsontran.error_comma') }}</h4>
            <p>错误：<code>{"id": 1,}</code> <br> 正确：<code>{"id": 1}</code></p>
          </div>
        </div>
      </div>
    </ToolDetail>
  </div>
</template>

<style scoped>
</style>