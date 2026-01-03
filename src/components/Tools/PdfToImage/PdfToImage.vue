<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage } from 'element-plus'
import { GlobalWorkerOptions } from "pdfjs-dist"
import worker from "pdfjs-dist/build/pdf.worker?url"
// 引入v-viewer
import 'viewerjs/dist/viewer.css'

// 设置PDF.js worker
GlobalWorkerOptions.workerSrc = worker

// PDF.js 相关
let pdfjsLib: any = null

const { t } = useI18n()

const info = reactive({
  title: "tools.pdftoimage.title",
})

// 状态管理
const isLoading = ref(false)
const isDragging = ref(false)
const convertedImages = ref<string[]>([])
const currentPdfName = ref('')
const progressText = ref('')
const currentProgress = ref(0)

// 转换设置
const settings = reactive({
  dpi: 300, // 高分辨率设置
  format: 'png', // 输出格式
  quality: 1.0 // 质量设置
})

// 异步加载 PDF.js
const loadPDFJS = async () => {
  try {
    console.log('开始加载PDF.js...')
    const pdfjs = await import('pdfjs-dist')
    
    pdfjsLib = pdfjs
    console.log('PDF.js 加载成功, version:', pdfjs.version)
    
  } catch (error) {
    console.error('PDF.js 加载失败:', error)
    ElMessage.error(t('tools.pdftoimage.load_error'))
  }
}

// 组件挂载时加载库
onMounted(() => {
  loadPDFJS()
})

// 文件处理
const handleFileSelect = (files: FileList | null) => {
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (file.type !== 'application/pdf') {
    ElMessage.error(t('tools.pdftoimage.select_error'))
    return
  }
  
  console.log('选择的PDF文件:', file.name, '大小:', file.size)
  currentPdfName.value = file.name
  convertPdfToImages(file)
}

// 修复文件选择函数的类型问题
const handleFileChange = (uploadFile: any) => {
  if (!uploadFile?.raw) return
  
  const file = uploadFile.raw as File
  if (file.type !== 'application/pdf') {
    ElMessage.error(t('tools.pdftoimage.select_error'))
    return
  }
  
  console.log('选择的PDF文件:', file.name, '大小:', file.size)
  currentPdfName.value = file.name
  convertPdfToImages(file)
}

// PDF转图片核心功能
const convertPdfToImages = async (file: File) => {
  if (!pdfjsLib) {
    ElMessage.error(t('tools.pdftoimage.lib_not_ready'))
    return
  }
  
  isLoading.value = true
  convertedImages.value = []
  progressText.value = t('tools.pdftoimage.reading_file')
  currentProgress.value = 0
  
  try {
    console.log('开始转换PDF...', file.name, file.size)
    const arrayBuffer = await file.arrayBuffer()
    console.log('PDF文件读取完成, 大小:', arrayBuffer.byteLength)
    
    progressText.value = t('tools.pdftoimage.parsing_pdf')
    console.log('开始解析PDF...')
    
    // 使用最简单的配置
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise
    
    const numPages = pdf.numPages
    console.log('PDF解析完成, 总页数:', numPages)
    ElMessage.success(t('tools.pdftoimage.load_success', { num: numPages }))
    
    // 转换每一页
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      progressText.value = t('tools.pdftoimage.converting_page', { current: pageNum, total: numPages })
      currentProgress.value = Math.round((pageNum - 1) / numPages * 100)
      
      console.log(`开始转换第${pageNum}页`)
      
      const page = await pdf.getPage(pageNum)
      console.log(`第${pageNum}页获取成功`)
      
      // 设置分辨率
      const scale = settings.dpi / 72
      const viewport = page.getViewport({ scale })
      console.log(`第${pageNum}页视窗尺寸:`, viewport.width, 'x', viewport.height)
      
      // 创建canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      console.log(`开始渲染第${pageNum}页到canvas`)
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      console.log(`第${pageNum}页渲染完成`)
      
      // 转换为图片
      const imageDataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality)
      convertedImages.value.push(imageDataUrl)
      console.log(`第${pageNum}页转换为图片完成`)
      
      // 更新进度
      currentProgress.value = Math.round(pageNum / numPages * 100)
      
      // 让UI有机会更新
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    progressText.value = t('tools.pdftoimage.convert_complete')
    console.log('所有页面转换完成')
    ElMessage.success(t('tools.pdftoimage.convert_complete'))
    
  } catch (error) {
    console.error('PDF转换失败:', error)
    progressText.value = t('tools.pdftoimage.convert_fail')
    
    // 修复TypeScript错误：添加类型检查
    const errorMessage = error instanceof Error ? error.message : t('tools.pdftoimage.unknown_error')
    ElMessage.error(`${t('tools.pdftoimage.convert_fail')}: ${errorMessage}`)
  } finally {
    isLoading.value = false
    currentProgress.value = 0
    progressText.value = ''
  }
}

// 下载图片
const downloadImage = (imageDataUrl: string, index: number) => {
  const link = document.createElement('a')
  link.href = imageDataUrl
  link.download = `${currentPdfName.value.replace('.pdf', '')}_第${index + 1}页.${settings.format}`
  link.click()
}

// 下载所有图片
const downloadAllImages = () => {
  convertedImages.value.forEach((imageDataUrl, index) => {
    setTimeout(() => {
      downloadImage(imageDataUrl, index)
    }, index * 100)
  })
}

// 拖拽处理
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

const handleDragLeave = () => {
  isDragging.value = false
}

// 清除结果
const clearResults = () => {
  convertedImages.value = []
  currentPdfName.value = ''
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white space-y-4">
      
      <!-- 转换设置 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('tools.pdftoimage.settings_dpi') }}</label>
          <el-select v-model="settings.dpi" class="w-full">
            <el-option label="150 DPI" :value="150" />
            <el-option label="300 DPI" :value="300" />
            <el-option label="600 DPI" :value="600" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('tools.pdftoimage.settings_format') }}</label>
          <el-select v-model="settings.format" class="w-full">
            <el-option label="PNG" value="png" />
            <el-option label="JPG" value="jpeg" />
          </el-select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('tools.pdftoimage.settings_quality') }}</label>
          <el-select v-model="settings.quality" class="w-full">
            <el-option :label="$t('tools.pdftoimage.quality_high')" :value="1.0" />
            <el-option :label="$t('tools.pdftoimage.quality_medium')" :value="0.8" />
            <el-option :label="$t('tools.pdftoimage.quality_low')" :value="0.6" />
          </el-select>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors"
        :class="{ 'border-blue-500 bg-blue-50': isDragging }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <div class="flex flex-col items-center space-y-4">
          <el-icon class="text-6xl text-gray-400">
            <Document />
          </el-icon>
          <div>
            <p class="text-lg text-gray-600 mb-2">{{ $t('tools.pdftoimage.drop_text') }}</p>
            <p class="text-sm text-gray-400">{{ $t('tools.pdftoimage.drop_subtext') }}</p>
          </div>
          <el-upload
            class="upload-demo"
            :before-upload="() => false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".pdf"
            :disabled="isLoading"
          >
            <el-button type="primary" :loading="isLoading">{{ $t('tools.pdftoimage.select_btn') }}</el-button>
          </el-upload>
        </div>
      </div>

      <!-- 转换进度 -->
      <div v-if="isLoading" class="text-center py-8">
        <el-progress 
          :percentage="currentProgress" 
          :indeterminate="currentProgress === 0"
          :stroke-width="8"
          class="mb-4"
        />
        <p class="mt-2 text-gray-600">{{ progressText }}</p>
        <p class="text-sm text-gray-400 mt-1">首次转换可能需要较长时间加载...</p>
      </div>

      <!-- 当前PDF信息 -->
      <div v-if="currentPdfName && !isLoading" class="p-3 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-800">{{ $t('tools.pdftoimage.current_file') }} {{ currentPdfName }}</p>
      </div>

      <!-- 转换结果 -->
      <div v-if="convertedImages.length > 0" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">{{ $t('tools.pdftoimage.result_title', { count: convertedImages.length }) }}</h3>
          <div class="space-x-2">
            <el-button @click="downloadAllImages" type="primary">
              <el-icon><Download /></el-icon>
              {{ $t('tools.pdftoimage.download_all') }}
            </el-button>
            <el-button @click="clearResults">{{ $t('tools.pdftoimage.clear_result') }}</el-button>
          </div>
        </div>
        
        <!-- 图片列表 - 添加v-viewer指令 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" v-viewer>
          <div 
            v-for="(imageUrl, index) in convertedImages" 
            :key="index"
            class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="aspect-[3/4] bg-gray-100 cursor-pointer">
              <img 
                :src="imageUrl" 
                :alt="`第${index + 1}页`"
                class="w-full h-full object-contain hover:opacity-90 transition-opacity"
                :title="`点击查看第${index + 1}页大图`"
              />
            </div>
            <div class="p-2 bg-white">
              <p class="text-xs text-gray-600 mb-2">{{ $t('tools.pdftoimage.page_n', { n: index + 1 }) }}</p>
              <el-button 
                @click="downloadImage(imageUrl, index)" 
                size="small" 
                type="primary" 
                class="w-full text-xs"
              >
                <el-icon class="text-xs"><Download /></el-icon>
                {{ $t('tools.pdftoimage.download') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 工具说明 -->
    <ToolDetail :title="$t('tools.pdftoimage.detail_features')">
      <el-text>
        <span v-html="$t('tools.pdftoimage.features_list')"></span>
      </el-text>
    </ToolDetail>

    <ToolDetail :title="$t('tools.pdftoimage.detail_usage')">
      <el-text>
         <span v-html="$t('tools.pdftoimage.usage_list')"></span>
      </el-text>
    </ToolDetail>

    <ToolDetail :title="$t('tools.pdftoimage.detail_notice')">
      <el-text>
         <span v-html="$t('tools.pdftoimage.notice_list')"></span>
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.upload-demo :deep(.el-upload) {
  border: none;
}

.upload-demo :deep(.el-upload-dragger) {
  border: none;
  background: transparent;
  width: auto;
  height: auto;
}
</style>
