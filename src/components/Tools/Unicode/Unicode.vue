<script setup lang="ts">
import { reactive } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/javascript/javascript.js";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const info = reactive({
  title: "tools.unicode.title",
  content: '',
  tranRes: '',
})

const cmOptions = {
  mode: "text/plain",
  lineNumbers: true,
  theme: "default",
  indentUnit: 2,
  tabSize: 2,
  lineWrapping: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
}

const clearRes = () => {
  info.tranRes = ''
}

//to zh
//值转换中文
const toZH = () => {
  //clear
  clearRes()
  let str = info.content
  str = str.replace(/\\/g, "%");
  // 转换中文
  str = unescape(str);
  info.tranRes = str
}
//to unicode
const toUnicode = () => {
  //clear
  clearRes()
  //只转换中文
  for (let i = 0; i < info.content.length; i++) {
    if (/^[\u4E00-\u9FA5\uF900-\uFA2D]+$/.test(info.content[i])) {
      let code = info.content.charCodeAt(i).toString(16)
      info.tranRes += '\\u' + code
    } else {
      info.tranRes += info.content[i]
    }
  }
}

//copy
const copyRes = async () => {
  copy(info.tranRes)
}

//清空输入框
const clear = () => {
  info.content = ''
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      
      <div>
        <Codemirror
          v-model:value="info.content"
          :options="cmOptions"
          border
          height="200"
          width="100%"
          :placeholder="$t('tools.unicode.placeholder')"
        />
      </div>
      
      <div class="mt-4">
        <el-button type="primary" @click="toZH">{{ $t('tools.unicode.btn_to_chinese') }}</el-button>
        <el-button type="primary" @click="toUnicode">{{ $t('tools.unicode.btn_to_unicode') }}</el-button>
        <el-button type="primary" @click="copyRes">{{ $t('tools.unicode.btn_copy') }}</el-button>
        <el-button type="primary" @click="clear">{{ $t('tools.unicode.btn_clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-input type="textarea" :rows="8" v-model="info.tranRes" :placeholder="$t('tools.unicode.result_placeholder')"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.unicode.detail_title')">
      <el-text>
        {{ $t('tools.unicode.desc') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>