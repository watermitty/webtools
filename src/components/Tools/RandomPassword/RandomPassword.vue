<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy, genRandomStrByChars } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const info = reactive({
  title: "tools.randompassword.title",
  char: '',
  pwLen: 16,
  pwNum: 5,
  resStr: '',
  autosize: {
    minRows: 5
  },
  checkedUpper: true,
  checkedLower: true,
  checkedNum: true,
  checkedSign: false,
  charNum: '0123456789',
  charUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  charLower: 'abcdefghijklmnopqrstuvwxyz',
  cahrSign: '~!@#$%^&*()_+',
})

//生成密码
const gen = () => {
  //包含字符验证
  if (info.char == '') {
    ElMessage({
      message: t('tools.randompassword.error_char_empty'),
      type: "warning",
      duration: 1500
    })
    return
  }

  //生成长度验证
  if (info.pwLen > 100) {
    ElMessage({
      message: t('tools.randompassword.error_len_range'),
      type: "warning",
      duration: 1500
    })
    return
  }

  //生成数量验证
  if (info.pwNum > 100) {
    ElMessage({
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
    info.resStr += genRandomStrByChars(info.char, info.pwLen) + ext
  }
}

const changeCheckBox = (val: any, type: number) => {
  switch(type) {
    case 0: 
      //设置数字字符
      setChar(val, /\d+/g, info.charNum)
      break;
    case 1: 
      //设置小写字母字符
      setChar(val, /[a-z]/g, info.charLower)
      break;
    case 2: 
      //设置大写字母字符
      setChar(val, /[A-Z]/g, info.charUpper)
      break;
    case 3: 
      //设置特殊符号字符
      setChar(val, /[~!@#$%^&*()_+]/g, info.cahrSign)
      break;
    default:
      info.char = ''
      break;
  }
}

//设置字符
const setChar = (val: boolean, reg: RegExp, charType: string) => {
  if (val == true) {
      //添加
      info.char += charType
    } else {
      //清除
      info.char = info.char.replace(reg, "")
    }
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}

const strength = computed(() => {
  const l = info.pwLen || 0
  const n = new Set(info.char.split('')).size
  if (l <= 0 || n <= 0) {
    return { entropy: 0, label: t('tools.randompassword.strength_none'), color: '#909399', percent: 0 }
  }
  const entropy = l * Math.log2(n)
  let label = t('tools.randompassword.strength_weak')
  let color = '#F56C6C'
  let percent = 20
  if (entropy >= 80) {
    label = t('tools.randompassword.strength_very_strong'); color = '#409EFF'; percent = 100
  } else if (entropy >= 60) {
    label = t('tools.randompassword.strength_strong'); color = '#67C23A'; percent = 80
  } else if (entropy >= 36) {
    label = t('tools.randompassword.strength_medium'); color = '#E6A23C'; percent = 60
  } else if (entropy >= 28) {
    label = t('tools.randompassword.strength_weak'); color = '#E6A23C'; percent = 35
  }
  return { entropy, label, color, percent }
})

onMounted(() => {
  //设置初始字符
  changeCheckBox(info.checkedNum, 0)
  changeCheckBox(info.checkedLower, 1)
  changeCheckBox(info.checkedUpper, 2)
  changeCheckBox(info.checkedSign, 3)
  gen()
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <el-text>{{ $t('tools.randompassword.password_combination') }}</el-text>
      <div>
        <el-checkbox v-model="info.checkedNum" :label="$t('tools.randompassword.number')"  @change="(val: any) => (changeCheckBox(val, 0))"/>
        <el-checkbox v-model="info.checkedLower" :label="$t('tools.randompassword.lower')"  @change="(val: any) => (changeCheckBox(val, 1))"/>
        <el-checkbox v-model="info.checkedUpper" :label="$t('tools.randompassword.upper')" @change="(val: any) => (changeCheckBox(val, 2))"/>
        <el-checkbox v-model="info.checkedSign" :label="$t('tools.randompassword.symbol')"  @change="(val: any) => (changeCheckBox(val, 3))"/>
      </div>
      <div>
        <el-input class="" v-model="info.char">
          <template #prepend>{{ $t('tools.randompassword.include_chars') }}</template>
        </el-input>
        <div class="mt-3">
          <el-text>{{ $t('tools.randompassword.length') }}: {{ info.pwLen }}</el-text>
          <el-slider v-model="info.pwLen" :min="1" :max="100" :step="1" />
        </div>
        <div class="mt-3">
          <el-text>{{ $t('tools.randompassword.quantity') }}: {{ info.pwNum }}</el-text>
          <el-slider v-model="info.pwNum" :min="1" :max="100" :step="1" />
        </div>
        <div class="mt-2">
          <el-text>{{ $t('tools.randompassword.strength') }}: {{ strength.label }}（约 {{ strength.entropy.toFixed(1) }} bits）</el-text>
          <el-progress :percentage="strength.percent" :color="strength.color" :stroke-width="8" />
        </div>
      </div>
      <div class="mt-3 mb-3">
        <el-button type="primary" @click="gen">{{ $t('tools.randompassword.generate') }}</el-button>
        <el-button type="primary" @click="copyRes(info.resStr)">{{ $t('tools.randompassword.copy_all') }}</el-button>
      </div>
      <!-- res -->
      <div>
        <el-input type="textarea" :autosize="info.autosize" v-model="info.resStr"></el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.randompassword.desc')">
      <el-text>
        {{ $t('tools.randompassword.desc') }}
      </el-text> 
      <el-text class="block mt-2">
        {{ $t('tools.randompassword.strength_text') }}
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>