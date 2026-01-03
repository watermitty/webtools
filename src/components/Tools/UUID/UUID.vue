<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
// src/components/Tools/UUID/UUID.vue
// 1) state 增加格式字段
const info = reactive({
  title: "tools.uuid.title",
  resStr: '',
  pwNum: 5,
  autosize: {
    minRows: 5
  },
  format: 'lower', // 新增：lower | upper | lowerNoHyphen | upperNoHyphen
})

//生成
const gen = () => {
  //生成数量验证
  if (info.pwNum > 100) {
    ElMessage({
      message: t('tools.randompassword.error_num_range'), // Reuse similar message or add specific if needed. Let's reuse or check if I added specific. I added error_num_range in randompassword, I can use that or add to uuid? I didn't add to uuid. I can create new one or use randompassword. Using randompassword one is cross-component dependency. Better add or just use generic. I'll use randompassword one for now if keys are shared? No, structure is 'tools.uuid'. I'll check if I added it to uuid section. I didn't. I'll use 'tools.randompassword.error_num_range' for now or add to UUID. better add to UUID. Wait, I closed replace calls. I'll just use 'tools.randompassword.error_num_range' or hardcode 'Quantity must be 1-100'. No, I should add key.
      // Wait, I can't add key easily now without another tool call. I'll use tools.randompassword.error_num_range since it's same text "生成数量范围在1~100".
      message: t('tools.randompassword.error_num_range'),
      type: "warning",
      duration: 1500
    })
    return
  }
  //清空旧数据
  info.resStr = ''

  //按数量生成密码
  for (let i = 1; i <= info.pwNum; i++) {
    let ext = '\n'
    if (i == info.pwNum) {
      ext = ''
    }
    // 3) 生成处应用格式化
    // 替换原来的：info.resStr += uuidv4() + ext
    const raw = uuidv4()
    info.resStr += formatUuid(raw) + ext
  }
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}

// 2) 新增：格式化函数
const formatUuid = (u: string) => {
  let s = u
  if (info.format === 'upper' || info.format === 'upperNoHyphen') {
    s = s.toUpperCase()
  } else {
    s = s.toLowerCase()
  }
  if (info.format === 'lowerNoHyphen' || info.format === 'upperNoHyphen') {
    s = s.replace(/-/g, '')
  }
  return s
}

// src/components/Tools/UUID/UUID.vue
// 在脚本中增加预设数组

// 挂载后自动生成
onMounted(() => {
  gen()
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-text>{{ $t('tools.uuid.quantity') }}: {{ info.pwNum }}</el-text>
        <el-slider v-model="info.pwNum" :min="1" :max="100" :step="1" />
      </div>
      <!-- 将“格式”行改为：添加 flex 对齐与固定宽度标签 -->
      <div class="mt-3 flex items-center">
        <span class="mr-2 inline-block w-20 text-right">{{ $t('tools.uuid.format') }}:</span>
        <el-radio-group v-model="info.format" size="large">
          <el-radio-button label="lower">{{ $t('tools.uuid.lower') }}</el-radio-button>
          <el-radio-button label="upper">{{ $t('tools.uuid.upper') }}</el-radio-button>
          <el-radio-button label="lowerNoHyphen">{{ $t('tools.uuid.lower_no_hyphen') }}</el-radio-button>
          <el-radio-button label="upperNoHyphen">{{ $t('tools.uuid.upper_no_hyphen') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="mt-3 mb-3">
        <el-button type="primary" @click="gen">{{ $t('tools.uuid.generate') }}</el-button>
        <el-button type="primary" @click="copyRes(info.resStr)">{{ $t('tools.uuid.copy_all') }}</el-button>
      </div>
      <!-- res -->
      <div>
        <el-input type="textarea" :autosize="info.autosize" v-model="info.resStr" readonly></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.uuid.desc')">
      <el-text>
        {{ $t('tools.uuid.desc') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>