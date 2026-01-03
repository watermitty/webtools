<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

const { t } = useI18n()

const info = reactive({
  startNum: 1,
  endNum: 100,
  resNum: 0,
  genStatus: false,
})

const random = () => {
  info.genStatus = true
  let count = 0
  const genInterval = setInterval(() => {
      info.resNum = Math.floor(Math.random() * (info.endNum - info.startNum + 1)) + info.startNum; 
      count++
      if (count > 10) {
        clearTimeout(genInterval)
        info.genStatus = false
      }
  }, 50)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.randomnum.title')"></DetailHeader>

    <div class="flex flex-col items-center p-4 rounded-2xl bg-white">
      <div>
        <el-input-number v-model="info.startNum" :min="0" size="large"/>
        <el-input-number v-model="info.endNum" :min="0" size="large" class="ml-5"/>
      </div>

      <div class="h-60 text-8xl leading-[15rem]">
        {{ info.resNum }}
      </div>

      <div>
        <el-button @click="random" type="primary" size="large" v-if="!info.genStatus">{{ $t('tools.randomnum.generate') }}</el-button>
        <el-button @click="random" type="primary" size="large" disabled v-else>{{ $t('tools.randomnum.generating') }}</el-button>
      </div>
    </div>
    <!-- desc -->
    <ToolDetail :title="$t('tools.randomnum.detail_title')">
      <el-text>
        {{ $t('tools.randomnum.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>