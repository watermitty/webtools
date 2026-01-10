<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'




// 单位选项
const units = [
  { labelKey: 'tools.filesize.units.bytes', value: 'B', key: 'bytes', color: 'bg-blue-50 border-blue-200' },
  { labelKey: 'tools.filesize.units.kb', value: 'KB', key: 'kb', color: 'bg-green-50 border-green-200' },
  { labelKey: 'tools.filesize.units.mb', value: 'MB', key: 'mb', color: 'bg-purple-50 border-purple-200' },
  { labelKey: 'tools.filesize.units.gb', value: 'GB', key: 'gb', color: 'bg-orange-50 border-orange-200' },
  { labelKey: 'tools.filesize.units.tb', value: 'TB', key: 'tb', color: 'bg-red-50 border-red-200' },
  { labelKey: 'tools.filesize.units.pb', value: 'PB', key: 'pb', color: 'bg-indigo-50 border-indigo-200' },
  { labelKey: 'tools.filesize.units.eb', value: 'EB', key: 'eb', color: 'bg-pink-50 border-pink-200' },
  { labelKey: 'tools.filesize.units.zb', value: 'ZB', key: 'zb', color: 'bg-yellow-50 border-yellow-200' },
  { labelKey: 'tools.filesize.units.yb', value: 'YB', key: 'yb', color: 'bg-teal-50 border-teal-200' },
]

// 单位转换系数（以字节为基准）
const unitFactors = {
  'B': 1,
  'KB': 1024,
  'MB': 1024 * 1024,
  'GB': 1024 * 1024 * 1024,
  'TB': 1024 * 1024 * 1024 * 1024,
  'PB': 1024 * 1024 * 1024 * 1024 * 1024,
  'EB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  'ZB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  'YB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
}

const info = reactive({
  title: "tools.filesize.title",
  // 每个单位对应的输入值，MB默认为1
  bytes: '',
  kb: '',
  mb: '1',
  gb: '',
  tb: '',
  pb: '',
  eb: '',
  zb: '',
  yb: '',
})

// 监听所有输入框的变化
const handleInputChange = (field: string, value: string) => {
  if (!value || isNaN(Number(value))) {
    // 清空所有输入框
    Object.keys(info).forEach(key => {
      if (key !== 'title') {
        info[key as keyof typeof info] = ''
      }
    })
    return
  }

  const inputNum = parseFloat(value)
  const unit = units.find(u => u.key === field)?.value || 'B'
  const bytes = inputNum * unitFactors[unit as keyof typeof unitFactors]

  // 计算其他单位的值
  units.forEach(unit => {
    if (unit.key !== field) {
      const result = bytes / unitFactors[unit.value as keyof typeof unitFactors]
      info[unit.key as keyof typeof info] = result.toFixed(6).replace(/\.?0+$/, '')
    }
  })
}

// 清空所有输入框
const clearAll = () => {
  units.forEach(unit => {
    info[unit.key as keyof typeof info] = ''
  })
}

// 组件挂载时计算初始值
onMounted(() => {
  // 以1MB为基准计算其他单位的值
  const bytes = 1 * unitFactors['MB']
  
  units.forEach(unit => {
    if (unit.key !== 'mb') {
      const result = bytes / unitFactors[unit.value as keyof typeof unitFactors]
      info[unit.key as keyof typeof info] = result.toFixed(6).replace(/\.?0+$/, '')
    }
  })
})
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1 mr-3">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-6 rounded-2xl bg-white shadow-sm">
      <div class="max-w-6xl mx-auto">
        <!-- 输入区域 -->
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div 
              v-for="unit in units" 
              :key="unit.key"
              :class="`${unit.color} p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md`"
            >
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                {{ $t(unit.labelKey) }}
              </label>
              <el-input
                v-model="info[unit.key as keyof typeof info]"
                @input="(value) => handleInputChange(unit.key, value)"
                placeholder="0"
                type="number"
                class="w-full"
                clearable
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center">
            <el-button @click="clearAll" type="info">
              {{ $t('tools.filesize.btn_clear') }}
            </el-button>
          </div>
        </div>

        <!-- 常用转换示例 -->
        <div class="mt-8 border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('tools.filesize.examples_title') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="font-medium text-blue-900 mb-2">1 MB = 1024 KB</h4>
              <p class="text-sm text-blue-600">{{ $t('tools.filesize.example_desc_mb') }}</p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 class="font-medium text-green-900 mb-2">1 GB = 1024 MB</h4>
              <p class="text-sm text-green-600">{{ $t('tools.filesize.example_desc_gb') }}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 class="font-medium text-purple-900 mb-2">1 TB = 1024 GB</h4>
              <p class="text-sm text-purple-600">{{ $t('tools.filesize.example_desc_tb') }}</p>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 class="font-medium text-orange-900 mb-2">1 PB = 1024 TB</h4>
              <p class="text-sm text-orange-600">{{ $t('tools.filesize.example_desc_pb') }}</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 class="font-medium text-red-900 mb-2">1 EB = 1024 PB</h4>
              <p class="text-sm text-red-600">{{ $t('tools.filesize.example_desc_eb') }}</p>
            </div>
            <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 class="font-medium text-indigo-900 mb-2">1 ZB = 1024 EB</h4>
              <p class="text-sm text-indigo-600">{{ $t('tools.filesize.example_desc_zb') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具详情 -->
    <ToolDetail :title="$t('tools.filesize.desc')">
      <el-text>
        {{ $t('tools.filesize.desc') }}
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.el-input .el-input__inner {
  background-color: white;
}
</style> 