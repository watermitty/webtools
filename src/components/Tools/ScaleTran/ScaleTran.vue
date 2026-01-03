<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/string'
import { isBinary, isOctal, isDecimal, isHexadecimal } from '@/utils/verify'
import { InfoFilled } from '@element-plus/icons-vue'
import { scale58ToBase, scale62ToBase, scale64ToBase, baseToScale58, baseToScale62, baseToScale64 } from '@/utils/math'

const { t } = useI18n()

const info = reactive({
  content: '',
  chooseTranOptions: '10',
  tranOptions: [
    { value: '2', label: '', tranValue: '', desc: '' },
    { value: '8', label: '', tranValue: '', desc: '' },
    { value: '10', label: '', tranValue: '', desc: '' },
    { value: '16', label: '', tranValue: '', desc: '' },
    { value: '32', label: '', tranValue: '', desc: '' },
    { value: '58', label: '', tranValue: '', desc: '' },
    { value: '62', label: '', tranValue: '', desc: '' },
    { value: '64', label: '', tranValue: '', desc: '' },
  ]
})

// Initialize labels with i18n
const initLabels = () => {
  info.tranOptions[0].label = t('tools.scaletran.base2')
  info.tranOptions[1].label = t('tools.scaletran.base8')
  info.tranOptions[2].label = t('tools.scaletran.base10')
  info.tranOptions[3].label = t('tools.scaletran.base16')
  info.tranOptions[4].label = t('tools.scaletran.base32')
  info.tranOptions[4].desc = t('tools.scaletran.base32_desc')
  info.tranOptions[5].label = t('tools.scaletran.base58')
  info.tranOptions[5].desc = t('tools.scaletran.base58_desc')
  info.tranOptions[6].label = t('tools.scaletran.base62')
  info.tranOptions[6].desc = t('tools.scaletran.base62_desc')
  info.tranOptions[7].label = t('tools.scaletran.base64')
  info.tranOptions[7].desc = t('tools.scaletran.base64_desc')
}
initLabels()

const tailScaleToBase = (content: string, scale: number): number => {
  let res = 0
  switch(scale) {
    case 58:
      res = scale58ToBase(content)
      break;
    case 62:
      res = scale62ToBase(content)
      break;
    case 64:
      res = scale64ToBase(content)
      break;
    default:
      ElMessage({ message: t('tools.scaletran.error_param'), type: "warning", duration: 1500 })
  }
  return res
}

const baseToTailScale = (num: number, scale: number): string => {
  let res = ''
  switch(scale) {
    case 58:
      res = baseToScale58(num)
      break;
    case 62:
      res = baseToScale62(num)
      break;
    case 64:
      res = baseToScale64(num)
      break;
    default:
      ElMessage({ message: t('tools.scaletran.error_param'), type: "warning", duration: 1500 })
  }
  return res
}

const tranCheck = () => {
  if (!info.content) {
    ElMessage({ message: t('tools.scaletran.error_empty'), type: "warning", duration: 1500 })
    return false
  }

  if (info.chooseTranOptions == '2' && isBinary(info.content) == false) {
    ElMessage({ message: t('tools.scaletran.error_binary'), type: "warning", duration: 1500 })
    return false
  }

  if (info.chooseTranOptions == '8' && isOctal(info.content) == false) {
    ElMessage({ message: t('tools.scaletran.error_octal'), type: "warning", duration: 1500 })
    return false
  }

  if (info.chooseTranOptions == '10' && isDecimal(info.content) == false) {
    ElMessage({ message: t('tools.scaletran.error_decimal'), type: "warning", duration: 1500 })
    return false
  }

  if (info.chooseTranOptions == '16' && isHexadecimal(info.content) == false) {
    ElMessage({ message: t('tools.scaletran.error_hex'), type: "warning", duration: 1500 })
    return false
  }

  return true
}

const tran = () => {
  if (!tranCheck()) return

  let tranContent
  let chooseTranInt = parseInt(info.chooseTranOptions, 10)
  if (chooseTranInt <= 36) {
    tranContent = parseInt(info.content, chooseTranInt)
  } else {
    tranContent = tailScaleToBase(info.content, chooseTranInt)
  }
  
  for (let index in info.tranOptions) {
    let valueInt = parseInt(info.tranOptions[index].value, 10)
    if (valueInt <= 36) {
      info.tranOptions[index].tranValue = tranContent.toString(valueInt)
    } else {
      info.tranOptions[index].tranValue = baseToTailScale(tranContent, valueInt)
    }
  }
}

const copyRes = async (index: any) => {
  copy(info.tranOptions[index].tranValue)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1 ">
    <DetailHeader :title="$t('tools.scaletran.title')"></DetailHeader>
    <div class="p-4 rounded-2xl bg-white">
      <div class="flex">
        <div class="mr-2 w-full">
          <el-input v-model="info.content" :placeholder="$t('tools.scaletran.placeholder')">
            <template #prepend>
              <el-select v-model="info.chooseTranOptions" :placeholder="$t('tools.scaletran.select')" class="choosetranoptions-select">
                <el-option
                  v-for="item in info.tranOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-input>
        </div>
        
        <el-button type="primary" @click="tran()">{{ $t('tools.scaletran.convert') }}</el-button>
      </div>

      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3 flex flex-col">
        <el-table :data="info.tranOptions" border style="width: 100%">
          <el-table-column prop="label" :label="$t('tools.scaletran.base')" width="120">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mr-1">{{ scope.row.label }}</span>
                <el-tooltip
                  v-if="scope.row.desc != ''"
                  class="box-item"
                  effect="dark"
                  :content="scope.row.desc"
                  placement="top-start"
                ><el-icon ><InfoFilled /></el-icon></el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="tranValue" :label="$t('tools.scaletran.result')"/>
          <el-table-column prop="" :label="$t('tools.scaletran.action')" width="80">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click.prevent="copyRes(scope.$index)"
              >
                {{ $t('tools.scaletran.copy') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- desc -->
    <ToolDetail :title="$t('tools.scaletran.detail_title')">
      <el-text>
        {{ $t('tools.scaletran.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
.choosetranoptions-select{
  @apply w-24
}
</style>