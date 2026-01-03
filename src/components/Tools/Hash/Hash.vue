<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-512' | 'HMAC-SHA256'

const state = reactive({
  algo: 'SHA-256' as Algo,
  text: '',
  hmacKey: '',
  textResult: '',
  fileResult: '',
  fileName: '',
  fileSize: 0,
  loadingText: false,
  loadingFile: false,
  file: null as File | null,
})

const enc = (s: string) => new TextEncoder().encode(s)
const toHex = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const ensureCrypto = () => {
  if (!window.crypto || !window.crypto.subtle) {
    ElMessage.error(t('tools.hash.error_crypto'))
    throw new Error('WebCrypto not available')
  }
}

const digestArrayBuffer = async (algo: Exclude<Algo, 'HMAC-SHA256'>, data: ArrayBuffer) => {
  ensureCrypto()
  const res = await crypto.subtle.digest({ name: algo }, data)
  return toHex(res)
}

const digestText = async () => {
  try {
    state.loadingText = true
    if (state.algo === 'HMAC-SHA256') {
      ensureCrypto()
      const key = await crypto.subtle.importKey(
        'raw',
        enc(state.hmacKey || ''),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const sig = await crypto.subtle.sign('HMAC', key, enc(state.text || ''))
      state.textResult = toHex(sig)
    } else {
      const res = await digestArrayBuffer(state.algo, enc(state.text || '').buffer)
      state.textResult = res
    }
  } catch (e) {
    // ignore, message already shown in ensureCrypto
  } finally {
    state.loadingText = false
  }
}

const digestFile = async (file: File) => {
  try {
    state.loadingFile = true
    if (state.algo === 'HMAC-SHA256') {
      ensureCrypto()
      const key = await crypto.subtle.importKey(
        'raw',
        enc(state.hmacKey || ''),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const buf = await file.arrayBuffer()
      const sig = await crypto.subtle.sign('HMAC', key, buf)
      state.fileResult = toHex(sig)
    } else {
      const buf = await file.arrayBuffer()
      const res = await digestArrayBuffer(state.algo, buf)
      state.fileResult = res
    }
  } catch (e) {
    // ignore
  } finally {
    state.loadingFile = false
  }
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  state.fileName = file.name
  state.fileSize = file.size
  state.file = file
  await digestFile(file)
}

const clearText = () => {
  state.text = ''
  state.textResult = ''
}

const clearFile = (inputRef?: HTMLInputElement | null) => {
  state.fileName = ''
  state.fileSize = 0
  state.fileResult = ''
  state.file = null
  state.loadingFile = false
  if (inputRef) inputRef.value = ''
}

const copyTextRes = () => copy(state.textResult)
const copyFileRes = () => copy(state.fileResult)

const fillExample = () => {
  state.text = 'The quick brown fox jumps over the lazy dog'
}

watch(
  () => [state.text, state.algo, state.hmacKey],
  () => {
    digestText()
    if (state.file) digestFile(state.file)
  }
)
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.hash.title')" />
    <div class="p-4 rounded-2xl bg-white">
      <div class="flex flex-wrap gap-3 items-center">
        <div>
          <el-select v-model="state.algo" :placeholder="$t('tools.hash.select_algo')" style="width: 180px;">
            <el-option label="SHA-1" value="SHA-1" />
            <el-option label="SHA-256" value="SHA-256" />
            <el-option label="SHA-512" value="SHA-512" />
            <el-option label="HMAC-SHA256" value="HMAC-SHA256" />
          </el-select>
        </div>
        <div v-if="state.algo === 'HMAC-SHA256'" class="flex-1 min-w-[240px]">
          <el-input v-model="state.hmacKey" :placeholder="$t('tools.hash.hmac_key')" />
        </div>
      </div>

      <!-- Text Hash/HMAC -->
      <div class="mt-4">
        <div class="mb-2 text-sm text-gray-600">
          {{ $t('tools.hash.text_hash') }}
          <el-link class="ml-2" type="primary" @click="fillExample">{{ $t('tools.hash.fill_example') }}</el-link>
        </div>
        <el-input
          v-model="state.text"
          type="textarea"
          :rows="6"
          :placeholder="$t('tools.hash.placeholder')"
        />
        <div class="mt-2 flex flex-wrap gap-2 button-container">
          <el-button @click="copyTextRes">{{ $t('tools.hash.copy_result') }}</el-button>
          <el-button type="danger" @click="clearText">{{ $t('tools.hash.clear') }}</el-button>
        </div>
        <div class="mt-3">
          <div class="text-sm text-gray-600 mb-1">{{ $t('tools.hash.result') }}</div>
          <el-input v-model="state.textResult" readonly />
        </div>
      </div>

      <!-- File Hash/HMAC -->
      <div class="mt-6">
        <div class="mb-2 text-sm text-gray-600">{{ $t('tools.hash.file_hash') }}</div>
        <input type="file" @change="onFileChange" />
        <div v-if="state.fileName" class="mt-2 text-xs text-gray-500">
          {{ $t('tools.hash.file') }}{{ state.fileName }}（{{ state.fileSize }} {{ $t('tools.hash.bytes') }} ≈ {{ (state.fileSize/1024).toFixed(2) }} KB / {{ (state.fileSize/1024/1024).toFixed(2) }} MB / {{ (state.fileSize/1024/1024/1024).toFixed(2) }} GB）
        </div>
        <div class="mt-2 flex flex-wrap gap-2 button-container">
          <el-button @click="copyFileRes">{{ $t('tools.hash.copy_result') }}</el-button>
          <el-button type="danger" @click="clearFile($event?.target as HTMLInputElement)">{{ $t('tools.hash.clear') }}</el-button>
          <el-button v-if="state.loadingFile" :loading="true" disabled>{{ $t('tools.hash.computing') }}</el-button>
        </div>
        <div class="mt-3">
          <div class="text-sm text-gray-600 mb-1">{{ $t('tools.hash.result') }}</div>
          <el-input v-model="state.fileResult" readonly />
        </div>
      </div>
    </div>

    <ToolDetail :title="$t('tools.hash.detail_title')">
      <el-text>
        {{ $t('tools.hash.detail_content') }}
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