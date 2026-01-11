<script setup lang="ts">
import { ref, reactive, onUnmounted, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

const { t } = useI18n()

// 先尝试动态导入Compressor.js，避免导入问题
let Compressor: any = null

// 异步加载Compressor.js
const loadCompressor = async () => {
  try {
    const module = await import('compressorjs')
    Compressor = module.default || module
    console.log('Compressor.js 加载成功:', Compressor)
  } catch (error) {
    console.error('Compressor.js 加载失败:', error)
    alert(t('tools.imgcompress.msg_lib_fail'))
  }
}

// 组件挂载时加载库
onMounted(() => {
  loadCompressor()
})

// 修改压缩配置，移除尺寸限制
const compressionConfig = reactive({
  quality: 0.6, // 降低默认质量，确保有压缩效果
  convertSize: 1000000,
  convertToWebP: false,
  retainExif: false,
  smartCompression: true,
})

// 状态
const isDragging = ref(false)
const isCompressing = ref(false)
const originalImages = ref<File[]>([])
const compressedImages = ref<CompressedImage[]>([])
const debugInfo = ref<string[]>([]) // 添加调试信息

// 文件处理
const handleFileSelect = (files: FileList | null) => {
  if (!files) return
  
  const imageFiles = Array.from(files).filter(file => 
    file.type.startsWith('image/')
  )
  
  if (imageFiles.length === 0) {
    alert(t('tools.imgcompress.msg_select_img'))
    return
  }
  
  originalImages.value = [...originalImages.value, ...imageFiles]
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files) {
    handleFileSelect(files)
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

// 添加调试信息
const addDebugInfo = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  debugInfo.value.push(`[${timestamp}] ${message}`)
  console.log(message)
}

// 压缩图片
const compressImages = async () => {
  if (originalImages.value.length === 0) return
  
  if (!Compressor) {
    alert(t('tools.imgcompress.msg_lib_fail'))
    return
  }
  
  isCompressing.value = true
  compressedImages.value = []
  addDebugInfo(t('tools.imgcompress.debug_start'))
  
  try {
    for (const file of originalImages.value) {
      await compressSingleImage(file)
    }
  } catch (error) {
    console.error('压缩失败:', error)
    addDebugInfo(`${t('tools.imgcompress.debug_fail')}: ${error}`)
    alert(t('tools.imgcompress.msg_error'))
  } finally {
    isCompressing.value = false
    addDebugInfo(t('tools.imgcompress.debug_complete'))
  }
}

// 修改压缩函数，移除尺寸调整逻辑
const compressSingleImage = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    addDebugInfo(`${t('tools.imgcompress.debug_compressing')}: ${file.name} (${formatFileSize(file.size)})`)
    
    // 获取图片原始尺寸
    const img = new Image()
    img.onload = () => {
      
      // 智能压缩参数调整
      let quality = compressionConfig.quality
      
      if (compressionConfig.smartCompression) {
        // 根据文件大小调整质量
        const sizeMB = file.size / (1024 * 1024)
        if (sizeMB > 5) {
          quality = Math.min(quality, 0.5)
        } else if (sizeMB > 2) {
          quality = Math.min(quality, 0.6)
        }
      }
      
      // 执行压缩，不设置尺寸限制
      new Compressor(file, {
        quality: quality,
        convertSize: compressionConfig.convertSize,
        convertToWebP: compressionConfig.convertToWebP,
        retainExif: compressionConfig.retainExif,
        success: (result: File) => {
          const compressionRatio = ((file.size - result.size) / file.size * 100)
          
          const compressedImage: CompressedImage = {
            id: Date.now().toString() + Math.random(),
            originalFile: file,
            compressedFile: result,
            originalSize: file.size,
            compressedSize: result.size,
            compressionRatio: compressionRatio,
            url: URL.createObjectURL(result),
            actualQuality: quality,
            actualMaxWidth: img.width, // 显示原图尺寸
            actualMaxHeight: img.height
          }
          
          compressedImages.value.push(compressedImage)
          resolve()
        },
        error: (error: any) => {
          console.error('压缩失败:', error)
          reject(error)
        }
      })
    }
    
    img.onerror = () => {
      reject(new Error('无法读取图片'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// 修改接口定义，移除尺寸相关字段
interface CompressedImage {
  id: string
  originalFile: File
  compressedFile: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  url: string
  actualQuality?: number
  actualMaxWidth?: number // 改为显示原图尺寸
  actualMaxHeight?: number
}

const info = reactive({
  title: "tools.imgcompress.title",
})

// 下载压缩后的图片
const downloadImage = (image: CompressedImage) => {
  const link = document.createElement('a')
  link.href = image.url
  link.download = `compressed_${image.originalFile.name}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 批量下载
const downloadAll = () => {
  compressedImages.value.forEach(image => {
    downloadImage(image)
  })
}

// 清空所有图片
const clearAll = () => {
  originalImages.value = []
  compressedImages.value.forEach(image => {
    URL.revokeObjectURL(image.url)
  })
  compressedImages.value = []
  debugInfo.value = []
}

// 移除单张图片
const removeImage = (index: number) => {
  const image = originalImages.value[index]
  originalImages.value.splice(index, 1)
  
  // 同时移除对应的压缩结果
  const compressedIndex = compressedImages.value.findIndex(
    comp => comp.originalFile === image
  )
  if (compressedIndex !== -1) {
    const compressed = compressedImages.value[compressedIndex]
    URL.revokeObjectURL(compressed.url)
    compressedImages.value.splice(compressedIndex, 1)
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取压缩建议
const getCompressionSuggestion = (file: File) => {
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > 5) {
    return t('tools.imgcompress.suggestion_large')
  } else if (sizeMB > 2) {
    return t('tools.imgcompress.suggestion_medium')
  } else if (sizeMB > 1) {
    return t('tools.imgcompress.suggestion_small')
  } else {
    return t('tools.imgcompress.suggestion_tiny')
  }
}

// 组件卸载时清理URL
onUnmounted(() => {
  compressedImages.value.forEach(image => {
    URL.revokeObjectURL(image.url)
  })
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <!-- 压缩配置 -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('tools.imgcompress.settings_title') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- 智能压缩开关 -->
          <div class="flex items-center col-span-full">
            <input
              v-model="compressionConfig.smartCompression"
              type="checkbox"
              id="smartCompression"
              class="mr-2"
            />
            <label for="smartCompression" class="text-sm font-medium text-gray-700">
              {{ $t('tools.imgcompress.label_smart') }}
            </label>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('tools.imgcompress.label_quality') }}</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="compressionConfig.quality"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                class="flex-1"
              />
              <span class="text-sm text-gray-600 w-12">{{ Math.round(compressionConfig.quality * 100) }}%</span>
            </div>
            <p class="text-xs text-gray-600 mt-1">
              {{ $t('tools.imgcompress.hint_quality') }}
            </p>
          </div>
          
          <!-- 移除最大宽度和最大高度配置 -->
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('tools.imgcompress.label_threshold') }}
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.imgcompress.hint_threshold_small') }}</span>
            </label>
            <div class="space-y-2">
              <input
                v-model="compressionConfig.convertSize"
                type="range"
                min="100000"
                max="10000000"
                step="100000"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>100KB</span>
                <span>{{ formatFileSize(compressionConfig.convertSize) }}</span>
                <span>10MB</span>
              </div>
              <p class="text-xs text-gray-600">
                <!-- 简单替换 -->
                {{ $t('tools.imgcompress.hint_threshold_desc').replace('{size}', formatFileSize(compressionConfig.convertSize)) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="compressionConfig.convertToWebP"
              type="checkbox"
              id="convertToWebP"
              class="mr-2"
            />
            <label for="convertToWebP" class="text-sm font-medium text-gray-700">{{ $t('tools.imgcompress.label_webp') }}</label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="compressionConfig.retainExif"
              type="checkbox"
              id="retainExif"
              class="mr-2"
            />
            <label for="retainExif" class="text-sm font-medium text-gray-700">{{ $t('tools.imgcompress.label_exif') }}</label>
          </div>
        </div>
      </div>

      <!-- 调试信息 -->
      <div v-if="debugInfo.length > 0" class="mb-6 p-4 bg-gray-100 rounded-lg">
        <h4 class="font-medium mb-2">{{ $t('tools.imgcompress.debug_title') }}</h4>
        <div class="text-xs text-gray-600 max-h-32 overflow-y-auto">
          <div v-for="(info, index) in debugInfo" :key="index" class="mb-1">
            {{ info }}
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="mb-6">
        <div
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          :class="[
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          ]"
        >
          <div class="text-4xl mb-4">️</div>
          <p class="text-lg font-medium text-gray-700 mb-2">{{ $t('tools.imgcompress.drag_hint') }}</p>
          <p class="text-sm text-gray-500 mb-4">{{ $t('tools.imgcompress.format_hint') }}</p>
          <input
            type="file"
            multiple
            accept="image/*"
            @change="(e) => handleFileSelect((e.target as HTMLInputElement).files)"
            class="hidden"
            id="fileInput"
          />
          <label
            for="fileInput"
            class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
          >
            {{ $t('tools.imgcompress.btn_select') }}
          </label>
        </div>
      </div>

      <!-- 原始图片列表 -->
      <div v-if="originalImages.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ $t('tools.imgcompress.pending_title', { count: originalImages.length }) }}</h3>
          <button
            @click="compressImages"
            :disabled="isCompressing || !Compressor"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!isCompressing">{{ $t('tools.imgcompress.btn_start') }}</span>
            <span v-else class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ $t('tools.imgcompress.btn_compressing') }}
            </span>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(file, index) in originalImages"
            :key="index"
            class="border rounded-lg p-4 relative"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 truncate">{{ file.name }}</span>
              <button
                @click="removeImage(index)"
                class="text-red-500 hover:text-red-700 text-lg"
              >
                ×
              </button>
            </div>
            <div class="text-xs text-gray-500 mb-2">{{ formatFileSize(file.size) }}</div>
            <div class="text-xs text-gray-500 mb-2">{{ file.type }}</div>
            <!-- 压缩建议 -->
            <div class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              {{ getCompressionSuggestion(file) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 压缩结果 -->
      <div v-if="compressedImages.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ $t('tools.imgcompress.result_title', { count: compressedImages.length }) }}</h3>
          <button
            @click="downloadAll"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {{ $t('tools.imgcompress.btn_download_all') }}
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="image in compressedImages"
            :key="image.id"
            class="border rounded-lg p-4"
          >
            <div class="mb-3">
              <img
                :src="image.url"
                :alt="image.originalFile.name"
                class="w-full h-32 object-cover rounded border"
              />
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('tools.imgcompress.label_original_size') }}</span>
                <span class="font-medium">{{ formatFileSize(image.originalSize) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('tools.imgcompress.label_compressed_size') }}</span>
                <span class="font-medium">{{ formatFileSize(image.compressedSize) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('tools.imgcompress.label_ratio') }}</span>
                <span class="font-medium text-green-600">{{ image.compressionRatio.toFixed(1) }}%</span>
              </div>
            </div>
            
            <!-- 显示实际使用的压缩参数 -->
            <div v-if="image.actualQuality" class="text-xs text-gray-500 border-t pt-2 mt-2">
              <div>{{ $t('tools.imgcompress.label_actual_quality') }} {{ Math.round(image.actualQuality * 100) }}%</div>
              <div>{{ $t('tools.imgcompress.label_actual_size') }} {{ image.actualMaxWidth }}×{{ image.actualMaxHeight }}</div>
            </div>
            
            <button
              @click="downloadImage(image)"
              class="w-full mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {{ $t('tools.imgcompress.btn_download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end space-x-3">
        <button
          @click="clearAll"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {{ $t('tools.imgcompress.btn_clear_all') }}
        </button>
      </div>
    </div>

    <!-- 描述 -->
    <ToolDetail :title="$t('tools.imgcompress.detail_title')">
      <el-text>
        {{ $t('tools.imgcompress.detail_content') }}
      </el-text> 
    </ToolDetail>

    <ToolDetail :title="$t('tools.imgcompress.features_title')">
      <ul class="list-disc list-inside space-y-2 text-gray-700" v-html="$t('tools.imgcompress.features_list')">
      </ul>
    </ToolDetail>

    <ToolDetail :title="$t('tools.imgcompress.usage_title')">
      <ol class="list-decimal list-inside space-y-2 text-gray-700" v-html="$t('tools.imgcompress.usage_list')">
      </ol>
    </ToolDetail>

    <ToolDetail :title="$t('tools.imgcompress.faq_title')">
      <div class="space-y-3 text-gray-700" v-html="$t('tools.imgcompress.faq_content')">
      </div>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 自定义旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
