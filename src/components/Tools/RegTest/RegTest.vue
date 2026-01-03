<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/javascript/javascript.js";

const { t } = useI18n()
// import { lineNumbers } from '@codemirror/view';

const info = reactive({
  title: "tools.reg.title",
  // extensions: [lineNumbers()],
  reg: '',
  content: `一些测试实例:
邮箱1：demo@163.com
邮箱2：demo2@163.com
手机号：18899990000
url: https://toolsonline.dpdns.org、https://toolsonline.dpdns.org
IP: 192.168.0.1
时间：2025-08-08
`,
  matchRes: '',
  matchNum: 0,
  isAll: true,
  isCase: false,
  isParseErr: false,
  parseErr: '',
  regList: [
    { id: 1, titleKey: 'mobile', reg: '(13\\d|14[579]|15[^4\\D]|17[^49\\D]|18\\d)\\d{8}' },
    { id: 1, titleKey: 'mobile_strict', reg: '^1[3-9]\\d{9}$' },
    { id: 1, titleKey: 'url', reg: '(http|ftp|https):\\\/\\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?' },
    { id: 1, titleKey: 'url_simple', reg: '^https?:\\\/\\\/[^\\s\\/$.?#].[^\\s]*$' },
    { id: 1, titleKey: 'url_port', reg: '^https?:\\\/\\\/[^\\s/:]+(?::\\d{2,5})?(?:\\\/[^\\s]*)?$' },
    { id: 1, titleKey: 'email', reg: `\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}` },
    { id: 1, titleKey: 'chinese', reg: "[\u4e00-\u9fa5]" },
    { id: 1, titleKey: 'double_byte', reg: "[^\x00-\xff]+" },
    { id: 1, titleKey: 'id_card', reg: "\\d{17}[0-9Xx]|\\d{15}" },
    { id: 1, titleKey: 'integer', reg: "[1-9]\\d*" },
    { id: 1, titleKey: 'ipv4', reg: "\\d{0,3}\\.\\d{0,3}\\.\\d{0,3}\\.\\d{0,3}" },
    { id: 1, titleKey: 'ipv4_strict', reg: '^(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)$' },
    { id: 1, titleKey: 'ipv6', reg: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$' },
    { id: 1, titleKey: 'date', reg: "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)" },
    { id: 1, titleKey: 'timestamp', reg: '^\\d{10}(\\d{3})?$' },
    { id: 1, titleKey: 'float', reg: '^-?\\d+(?:\\.\\d+)?$' },
    { id: 1, titleKey: 'hex_color', reg: '^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$' },
    { id: 1, titleKey: 'zip_code', reg: '^[1-9]\\d{5}(?!\\d)$' },
    { id: 1, titleKey: 'qq', reg: '^[1-9][0-9]{4,10}$' },
    { id: 1, titleKey: 'wechat', reg: '^[a-zA-Z][-_a-zA-Z0-9]{5,19}$' },
    { id: 1, titleKey: 'username', reg: '^[a-zA-Z]\\w{5,19}$' },
    { id: 1, titleKey: 'password', reg: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\da-zA-Z]).{8,}$' },
    { id: 1, titleKey: 'landline', reg: '^0\\d{2,3}-?\\d{7,8}$' },
    { id: 1, titleKey: 'plate', reg: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$' },
    { id: 1, titleKey: 'bank_card', reg: '^[1-9]\\d{9,18}$' },
  ]
})

// src/components/Tools/RegTest/RegTest.vue （在 info 定义后增加）
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

//使用正则
const useReg = (reg: string) => {
  info.reg = reg
}

const clearOldRes = () => {
  info.matchNum = 0
  info.matchRes = ''
}

//测试匹配(执行匹配)
const execMatch = () => {
  //清除旧结果
  clearOldRes()
  //check
  if (info.reg == '') {
    return
  }
  
  let rule = ''
  //是否全局
  rule = info.isAll === true ? 'g' : ''
  //是否区分大小写
  rule += info.isCase === true ? 'i' : ''

  let pattern = new RegExp(info.reg, rule);
  let matchArr = info.content.match(pattern)
  
  if (info.isAll === true) {
    if (matchArr?.length) {
      info.matchNum = matchArr?.length
      for (let index in matchArr) {
        info.matchRes += matchArr[index] + `\n`
      }
    }
  } else {
    if (matchArr?.[0]) {
      info.matchRes = matchArr[0]
      info.matchNum = 1
    }
  }
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">
      <div>
        <Codemirror
          v-model:value="info.content"
          :options="cmOptions"
          border
          height="300"
          width="100%"
          :placeholder="$t('tools.reg.placeholder_text')"
        />
      </div>

      <div class="mt-4">
        <el-text class="font-bold">{{ $t('tools.reg.label_common_reg') }}</el-text>
        <ul class="flex flex-wrap">
          <li v-for="(item, index) in info.regList" :key="index">
            <el-button link type="primary" @click="useReg(item.reg)" class="mr-2 mt-2">
              {{ $t('tools.reg.regs.' + item.titleKey) }}
            </el-button>
          </li>
        </ul>
        <div class="flex items-center mt-4">
          <el-input v-model="info.reg" class="mr-2" :placeholder="$t('tools.reg.placeholder_reg')"></el-input>
          
          <div class="mr-2">
            <el-checkbox v-model="info.isAll" :label="$t('tools.reg.label_global')" size="large"/>
          </div>
          <div class="mr-2">
            <el-checkbox v-model="info.isCase" :label="$t('tools.reg.label_case_insensitive')" size="large" /> 
          </div>

          <el-button type="primary" @click="execMatch">{{ $t('tools.reg.btn_test') }}</el-button>
        </div>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-text>{{ $t('tools.reg.label_match_count', { count: info.matchNum }) }}</el-text>
        <el-input type="textarea" :rows="4" readonly v-model="info.matchRes"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.reg.detail_title')">
      <el-text>
        {{ $t('tools.reg.detail_content') }}
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>