<script setup lang="ts">
import { reactive } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy, numberToChinese } from '@/utils/string'


const info = reactive({
  content: '',
  tranRes: '',
})

const tran = () => {
  info.tranRes = numberToChinese(parseInt(info.content))
}

const clear = () => {
  info.content = ''
  info.tranRes = ''
}

const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.numtochinese.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-input type="number" v-model="info.content" :placeholder="$t('tools.numtochinese.placeholder')"></el-input>
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="tran">{{ $t('tools.numtochinese.convert') }}</el-button>
        <el-button type="primary" @click="copyRes(info.tranRes)">{{ $t('tools.numtochinese.copy_result') }}</el-button>
        <el-button type="danger" @click="clear">{{ $t('tools.numtochinese.clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-input type="textarea" :rows="8" v-model="info.tranRes" :placeholder="$t('tools.numtochinese.result_placeholder')"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.numtochinese.detail_title')">
      <el-text>
        {{ $t('tools.numtochinese.detail_content') }}
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>

</style>