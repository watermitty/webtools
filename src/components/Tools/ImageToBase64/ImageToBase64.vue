<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t } = useI18n()

const info = reactive({
  title: "tools.imgbase64.title",
})

const base64Result = ref('')
const fileName = ref('')
const fileSize = ref('')
const isDragOver = ref(false)
const isLoading = ref(false)

// 处理文件上传
const handleFileUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error(t('tools.imgbase64.msg_select_img'))
    return
  }

  isLoading.value = true
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    base64Result.value = result
    fileName.value = file.name
    fileSize.value = formatFileSize(file.size)
    isLoading.value = false
    ElMessage.success(t('tools.imgbase64.msg_success'))
  }
  
  reader.onerror = () => {
    isLoading.value = false
    ElMessage.error(t('tools.imgbase64.msg_fail'))
  }
  
  reader.readAsDataURL(file)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理拖拽
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

// 复制base64
const copyBase64 = async () => {
  if (base64Result.value) {
    await copy(base64Result.value)
    ElMessage.success(t('tools.imgbase64.msg_copy_success'))
  }
}

// 清空结果
const clearResult = () => {
  base64Result.value = ''
  fileName.value = ''
  fileSize.value = ''
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.imgbase64.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <!-- 上传区域 -->
      <div class="mb-6">
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors relative"
          :class="{ 'border-blue-500 bg-blue-50': isDragOver }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <!-- Loading遮罩 -->
          <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p class="text-gray-600">{{ $t('tools.imgbase64.loading') }}</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="text-gray-400">
              <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <p class="text-lg font-medium text-gray-900">{{ $t('tools.imgbase64.drag_hint') }}</p>
              <p class="text-sm text-gray-500">{{ $t('tools.imgbase64.format_hint') }}</p>
            </div>
            <div>
              <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :class="{ 'opacity-50 cursor-not-allowed': isLoading }">
                {{ $t('tools.imgbase64.btn_select') }}
                <input type="file" accept="image/*" class="hidden" @change="handleFileSelect" :disabled="isLoading" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件信息 -->
      <div v-if="fileName" class="mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">{{ fileName }}</p>
            <p class="text-sm text-gray-500">{{ $t('tools.imgbase64.label_size') }}{{ fileSize }}</p>
          </div>
          <button
            @click="clearResult"
            class="text-red-600 hover:text-red-800 text-sm"
            :disabled="isLoading"
          >
            {{ $t('tools.imgbase64.btn_clear') }}
          </button>
        </div>
      </div>

      <!-- Base64结果 -->
      <div v-if="base64Result" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ $t('tools.imgbase64.label_result') }}</h3>
          <button
            @click="copyBase64"
            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            :disabled="isLoading"
          >
            {{ $t('tools.imgbase64.btn_copy') }}
          </button>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <textarea
            :value="base64Result"
            readonly
            class="w-full h-32 p-3 border border-gray-300 rounded-md bg-white resize-none"
            :placeholder="$t('tools.imgbase64.placeholder')"
          ></textarea>
        </div>

        <!-- 预览 -->
        <div class="mt-4">
          <h4 class="text-md font-medium text-gray-900 mb-2">{{ $t('tools.imgbase64.preview') }}</h4>
          <div class="border border-gray-300 rounded-lg p-4 bg-white">
            <img :src="base64Result" alt="预览图片" class="max-w-full max-h-64 mx-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.imgbase64.detail_title')">
      <el-text>
        {{ $t('tools.imgbase64.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
</style>