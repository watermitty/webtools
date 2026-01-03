<script setup lang="ts">
import { reactive, ref } from 'vue'
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'qrcode-reader-vue3'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Camera, Upload, CopyDocument, Delete } from '@element-plus/icons-vue'

const { t } = useI18n()

const info = reactive({
  title: "tools.qrscan.title",
  scanResult: '',
  isScanning: false,
  activeTab: 'upload', 
})

// 识别结果
const scanResult = ref('')
const isScanning = ref(false)

// 识别二维码功能
const handleScan = (result: string) => {
  scanResult.value = result
  ElMessage.success(t('tools.qrscan.msg_success'))
  isScanning.value = false
}

const handleError = (error: any) => {
  console.error('扫描错误:', error)
  ElMessage.error(t('tools.qrscan.msg_fail'))
}

const startScan = () => {
  isScanning.value = true
}

const stopScan = () => {
  isScanning.value = false
}

// 复制结果
const copyResult = async () => {
  if (!scanResult.value) {
    ElMessage.warning(t('tools.qrscan.msg_no_content'))
    return
  }
  
  try {
    await navigator.clipboard.writeText(scanResult.value)
    ElMessage.success(t('tools.qrscan.msg_copy_success'))
  } catch (error) {
    ElMessage.error(t('tools.qrscan.msg_copy_fail'))
  }
}

// 清空结果
const clearResult = () => {
  scanResult.value = ''
  ElMessage.success(t('tools.qrscan.msg_clear'))
}

// 打开链接
const openLink = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1 mr-3">
    <DetailHeader :title="$t('tools.qrscan.title')"></DetailHeader>

    <div class="p-6 rounded-2xl bg-white shadow-sm">
      <!-- 识别方式选择 -->
      <el-tabs v-model="info.activeTab" class="mb-6">
        <el-tab-pane :label="$t('tools.qrscan.tab_image')" name="upload">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('tools.qrscan.heading_image') }}</h3>
            
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-md mx-auto">
              <!-- 使用 QrcodeCapture 处理文件上传 -->
              <QrcodeCapture
                @decode="handleScan"
                @error="handleError"
                class="w-full"
              >
                <!-- 自定义上传界面 -->
                <div class="text-center py-8">
                  <el-icon class="text-4xl text-gray-400 mb-4">
                    <Upload />
                  </el-icon>
                  <div class="text-gray-500">
                    <p>{{ $t('tools.qrscan.drag_hint') }}</p>
                    <p class="text-sm">{{ $t('tools.qrscan.format_hint') }}</p>
                  </div>
                </div>
              </QrcodeCapture>
              
              <!-- 拖拽区域 -->
              <QrcodeDropZone
                @decode="handleScan"
                @error="handleError"
                class="w-full h-32 mt-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                <div class="text-center">
                  <p class="text-gray-500 text-sm">{{ $t('tools.qrscan.drag_hint_2') }}</p>
                </div>
              </QrcodeDropZone>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('tools.qrscan.tab_camera')" name="camera">
          <div class="text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('tools.qrscan.heading_camera') }}</h3>
            
            <!-- 扫描区域 -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 max-w-md mx-auto">
              <QrcodeStream
                v-if="isScanning"
                @decode="handleScan"
                @error="handleError"
                class="w-full"
              />
              <div v-else class="text-center py-8">
                <el-icon class="text-4xl text-gray-400 mb-4">
                  <Camera />
                </el-icon>
                <p class="text-gray-500">{{ $t('tools.qrscan.scan_hint') }}</p>
              </div>
            </div>

            <!-- 控制按钮 -->
            <div class="space-x-4">
              <el-button 
                type="primary" 
                @click="startScan"
                :disabled="isScanning"
              >
                {{ $t('tools.qrscan.btn_start') }}
              </el-button>
              <el-button 
                @click="stopScan"
                :disabled="!isScanning"
              >
                {{ $t('tools.qrscan.btn_stop') }}
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 识别结果 -->
      <div v-if="scanResult" class="border-t pt-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-medium text-gray-900">{{ $t('tools.qrscan.result_title') }}</h4>
          <div class="space-x-2">
            <el-button 
              size="small" 
              @click="clearResult"
              type="danger"
            >
              <el-icon><Delete /></el-icon>
              {{ $t('tools.qrscan.btn_clear') }}
            </el-button>
            <el-button 
              size="small" 
              type="primary"
              @click="copyResult"
            >
              <el-icon><CopyDocument /></el-icon>
              {{ $t('tools.qrscan.btn_copy') }}
            </el-button>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700 break-all whitespace-pre-wrap">{{ scanResult }}</p>
        </div>
        
        <!-- 如果是链接，提供打开链接的按钮 -->
        <div v-if="scanResult.startsWith('http')" class="mt-4">
          <el-button 
            type="success" 
            @click="openLink(scanResult)"
          >
            {{ $t('tools.qrscan.btn_open') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 工具详情 -->
    <ToolDetail :title="$t('tools.qrscan.detail_title')">
      <el-text>
        <div v-html="$t('tools.qrscan.detail_content')"></div>
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 拖拽区域样式 */
.border-dashed:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}
</style> 