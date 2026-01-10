<script setup lang="ts">
import { reactive } from 'vue'

import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'



const info = reactive({
  content: '',
  chinaCharNum: 0,
  letterNum: 0,
  punctuationHalfNum: 0,
  punctuationFullNum: 0,
  numberNum: 0,
  emptyNum: 0,
  sum: 0,
})

const changeContent = () => {
  info.chinaCharNum = (info.content.match(/[\u4e00-\u9fa5]/g) || []).length;
  info.letterNum = (info.content.match(/[a-zA-Z]/g) || []).length;
  info.punctuationHalfNum = (info.content.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g) || []).length;
  info.punctuationFullNum = (info.content.match(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g) || []).length;
  info.numberNum = (info.content.match(/[\d+]/g) || []).length;
  info.emptyNum = (info.content.match(/[\s*]/g) || []).length;
  info.sum = info.chinaCharNum + info.letterNum + info.punctuationHalfNum + info.punctuationFullNum + info.numberNum + info.emptyNum;
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.wordcount.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-input type="textarea" :rows="16" v-model="info.content" @input="changeContent" :placeholder="$t('tools.wordcount.placeholder')"></el-input>
      </div>
      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3 flex flex-wrap gap-3">
        <div><el-text>{{ $t('tools.wordcount.total') }}{{ info.sum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.chinese') }}{{ info.chinaCharNum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.letters') }}{{ info.letterNum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.numbers') }}{{ info.numberNum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.punct_half') }}{{ info.punctuationHalfNum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.punct_full') }}{{ info.punctuationFullNum }}</el-text></div>
        <div><el-text>{{ $t('tools.wordcount.whitespace') }}{{ info.emptyNum }}</el-text></div>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.wordcount.detail_title')">
      <div class="leading-6">
        <div>{{ $t('tools.wordcount.detail_content') }}</div>
        <div>{{ $t('tools.wordcount.punct_note') }}</div>
        <div>{{ $t('tools.wordcount.punct_half_desc') }}</div>
        <div>{{ $t('tools.wordcount.punct_full_desc') }}</div>
      </div>
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>