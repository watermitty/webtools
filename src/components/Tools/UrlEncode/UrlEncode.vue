<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'


const info = reactive({
  title: "tools.urlencode.title",
  content: '',
  tranRes: '',
})

// 双向联动防抖标记
const syncing = ref(false)

// 上 → 下：实时编码
watch(() => info.content, (val) => {
  if (syncing.value) return
  syncing.value = true
  try {
    info.tranRes = encodeURIComponent(val || '')
  } finally {
    syncing.value = false
  }
})

// 下 → 上：实时解码
watch(() => info.tranRes, (val) => {
  if (syncing.value) return
  syncing.value = true
  try {
    info.content = decodeURIComponent(val || '')
  } catch (e) {
    // 非法编码时忽略更新，避免打断用户输入
  } finally {
    syncing.value = false
  }
})


//编码
const toEncode = () => {
  info.tranRes = ''
  info.tranRes = encodeURIComponent(info.content)
}

//解码
const toDecode = () => {
  info.tranRes = ''
  info.tranRes = decodeURIComponent(info.content)
}

//clear
const clear = () => {
  info.content = ''
  info.tranRes = ''
}

//copy
const copyRes = async () => {
  copy(info.tranRes)
}

const exampleRaw = 'name=张三&city=北京 上海?100%&note=空格/斜杠/&中文'
const exampleEncoded = encodeURIComponent(exampleRaw)
const fillExample = () => {
  info.content = exampleRaw
}

const copyContent = async () => {
  copy(info.content)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <div class="mb-2 text-gray-500 text-sm">
          {{ $t('tools.urlencode.raw_text') }}
          <el-link type="primary" class="ml-2" @click="copyContent">{{ $t('tools.urlencode.copy_raw') }}</el-link>
        </div>
        <div class="mb-1 text-xs text-gray-500 break-all">
          {{ $t('tools.urlencode.example') }}：{{ exampleRaw }}
          <el-link type="primary" class="ml-2" @click="fillExample">{{ $t('tools.urlencode.fill') }}</el-link>
        </div>
        <el-input
          type="textarea"
          :rows="8"
          v-model="info.content"
          :placeholder="$t('tools.urlencode.placeholder_raw')"
        />
      </div>

      <div class="mt-4 flex flex-wrap gap-2 button-container">
        <el-button @click="fillExample">{{ $t('tools.urlencode.fill_example') }}</el-button>
        <el-button type="primary" @click="toEncode">{{ $t('tools.urlencode.btn_encode') }}</el-button>
        <el-button type="primary" @click="toDecode">{{ $t('tools.urlencode.btn_decode') }}</el-button>
        <el-button type="primary" @click="copyRes">{{ $t('tools.urlencode.btn_copy') }}</el-button>
        <el-button type="danger" @click="clear">{{ $t('tools.urlencode.btn_clear') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3">
        <div class="mb-2 text-gray-500 text-sm">
          {{ $t('tools.urlencode.encoded_text') }}
          <el-link type="primary" class="ml-2" @click="copyRes">{{ $t('tools.urlencode.copy_encoded') }}</el-link>
        </div>
        <div class="mb-1 text-xs text-gray-500 break-all">示例：{{ exampleEncoded }}</div>
        <el-input
          type="textarea"
          :rows="8"
          v-model="info.tranRes"
          :placeholder="$t('tools.urlencode.placeholder_encoded')"
        />
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.urlencode.desc')">
      <el-text>
        {{ $t('tools.urlencode.desc') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
.button-container .el-button {
  margin-right: 12px;
  margin-left: 0px;
}
</style>