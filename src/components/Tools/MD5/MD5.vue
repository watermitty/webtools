<script setup lang="ts">
import { reactive } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Md5 } from 'ts-md5'
import { copy } from '@/utils/string'
const info = reactive({
  title: "tools.md5.title",
  encryptStr: '',
  encryptUpper32: '',
  encryptLower32: '',
  encryptUpper16: '',
  encryptLower16: '',
})

//加密
const encrypt = () => {
  info.encryptLower32 = Md5.hashStr(info.encryptStr)
  info.encryptUpper32 = info.encryptLower32.toUpperCase()
  info.encryptUpper16 = info.encryptUpper32.substring(8, 24)
  info.encryptLower16 = info.encryptLower32.substring(8, 24)
}

//清空输入框
const clear = () => {
  info.encryptStr = ''
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.md5.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">
      <div>
        <el-input v-model="info.encryptStr" :rows="5" type="textarea" :placeholder="$t('tools.md5.placeholder')"></el-input>
      </div>
      
      <div class="mt-4">
        <el-button type="primary" @click="encrypt()" >{{ $t('tools.md5.btn_encrypt') }}</el-button>
        <el-button type="primary" @click="clear()">{{ $t('tools.md5.btn_clear') }}</el-button>
      </div>

      <div class="w-[30rem]">
        <el-input :value="info.encryptUpper32" class="mt-4" readonly>
          <template #prepend>
            <el-text>{{ $t('tools.md5.label_32_upper') }}</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper32)">{{ $t('tools.md5.btn_copy') }}</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower32" class="mt-2" readonly>
          <template #prepend>
            <el-text>{{ $t('tools.md5.label_32_lower') }}</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower32)">{{ $t('tools.md5.btn_copy') }}</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptUpper16" class="mt-2" readonly>
          <template #prepend>
            <el-text>{{ $t('tools.md5.label_16_upper') }}</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper16)">{{ $t('tools.md5.btn_copy') }}</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower16" class="mt-2" readonly>
          <template #prepend>
            <el-text>{{ $t('tools.md5.label_16_lower') }}</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower16)">{{ $t('tools.md5.btn_copy') }}</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.md5.detail_title')">
      <div class="text-gray-600 leading-7">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.md5.what_is') }}</h3>
        <p class="mb-4">
          {{ $t('tools.md5.what_is_content') }}
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.md5.uses') }}</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>{{ $t('tools.md5.use_check') }}</strong></li>
          <li><strong>{{ $t('tools.md5.use_sign') }}</strong></li>
          <li><strong>{{ $t('tools.md5.use_store') }}</strong></li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mb-2 text-red-600">{{ $t('tools.md5.warning') }}</h3>
        <p class="mb-4 bg-red-50 p-3 rounded border border-red-100" v-html="$t('tools.md5.warning_content')">
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.md5.faq') }}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.md5.q1') }}</h4>
            <p>{{ $t('tools.md5.a1') }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.md5.q2') }}</h4>
            <p>{{ $t('tools.md5.a2') }}</p>
          </div>
        </div>
      </div>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>