<script setup lang="ts">
import { reactive } from 'vue'

import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'


const info = reactive({
  title: "tools.markdown.title",
  content: '',
})


//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="">
      <v-md-editor v-model="info.content" height="500px"></v-md-editor>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.markdown.detail_title')">
      <el-text>
        {{ $t('tools.markdown.desc') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>