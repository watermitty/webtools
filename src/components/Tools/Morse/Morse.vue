<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { toMorse, toText } from '@/utils/morse'

const { t } = useI18n()

const info = reactive({
  content: '',
  tranRes: '',
})

const toEncode = () => {
  info.tranRes = toMorse(info.content)
}

const toDecode = () => {
  info.tranRes = toText(info.content)
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
    <DetailHeader :title="$t('tools.morse.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">
      <div>
        <el-input type="textarea" :rows="8" v-model="info.content" :placeholder="$t('tools.morse.placeholder')"></el-input>
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="toEncode">{{ $t('tools.morse.encode') }}</el-button>
        <el-button type="primary" @click="toDecode">{{ $t('tools.morse.decode') }}</el-button>
        <el-button type="primary" @click="copyRes(info.tranRes)">{{ $t('tools.morse.copy_result') }}</el-button>
        <el-button type="danger" @click="clear">{{ $t('tools.morse.clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <el-input type="textarea" :rows="8" v-model="info.tranRes" :placeholder="$t('tools.morse.result_placeholder')"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.morse.detail_title')">
      <el-text>
        {{ $t('tools.morse.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>