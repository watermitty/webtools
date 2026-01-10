<script setup lang="ts">
import { reactive } from 'vue'

import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import CodeDiff  from "v-code-diff";



const info = reactive({
  leftTxt: '',
  rightTxt: ''
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.diff.title')"></DetailHeader>

    <div class="">
      <div class="flex justify-between">
        <el-input type="textarea" :rows="16" v-model="info.leftTxt" :placeholder="$t('tools.diff.old_text')"></el-input>
        <el-input type="textarea" :rows="16" v-model="info.rightTxt" :placeholder="$t('tools.diff.new_text')" class="ml-3"></el-input>
      </div>
      <code-diff
        :old-string="info.leftTxt"
        :new-string="info.rightTxt"
        output-format="side-by-side"
        theme="dark"
      />
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.diff.detail_title')">
      <el-text>
        {{ $t('tools.diff.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>