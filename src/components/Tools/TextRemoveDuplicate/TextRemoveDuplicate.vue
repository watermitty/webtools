<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t } = useI18n()

const info = reactive({
  content: '',
  tranRes: '',
})

const clear = () => {
  info.content = ''
}

const removeDuplicate = computed(() => {
  let tmpArr = info.content.split('\n')
  let resultSet = new Set(tmpArr)
  let fromResArr = Array.from(resultSet)
  info.tranRes = fromResArr.join("\n")
  return info.tranRes 
})

const copyRes = async () => {
  copy(info.tranRes)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.textunique.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-input type="textarea" :rows="8" v-model="info.content" :placeholder="$t('tools.textunique.placeholder')"></el-input>
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="copyRes">{{ $t('tools.textunique.copy_result') }}</el-button>
        <el-button type="danger" @click="clear">{{ $t('tools.textunique.clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-input type="textarea" :rows="8" v-model="removeDuplicate" :placeholder="$t('tools.textunique.result_placeholder')"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.textunique.detail_title')">
      <el-text>
        {{ $t('tools.textunique.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>