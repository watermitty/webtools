<script setup lang="ts">
import { reactive } from 'vue'


const info: {
  [key: string]: string|number
} = reactive({
  year: '',
  month: '',
  d: '',
  h: '',
  min: '',
  s: '',
  ms: '',
  week: ''
})

//clear
const clear = () => {
  for (let item in info) {
    info[item] = ''
  }
}

/**
 * 转换
 * @param type 
 */
const tran = (key: string) => {
  //转换成秒
  switch (key) {
    case 'year':
      info.s = parseFloat(info[key] as string) * 31536000
      break;
    case 'month':
      info.s = parseFloat(info[key] as string) * 2629800
      break;
    case 'd':
      info.s = parseFloat(info[key] as string) * 86400
      break;
    case 'h':
      info.s = parseFloat(info[key] as string) * 3600
      break;
    case 'min':
      info.s = parseFloat(info[key] as string) * 60
      break;
    case 's':
      info.s = parseFloat(info[key] as string) * 1
      break;
    case 'ms':
      info.s = parseFloat(info[key] as string) * 0.001
      break;
    case 'week':
      info.s = parseFloat(info[key] as string) * 604800
      break;
    default:
      break;
  }

  //转换成其他单位
  let val = info.s as number
  info.year = val / 31536000
  info.month = info.year * 12
  info.d = val / 86400
  info.h = val / 3600
  info.min = val / 60
  info.ms = val / 0.001
  info.week = val / 604800
}

</script>

<template>
    <div>
      <div>
        <el-divider content-position="left">{{ $t('tools.unit.time.title') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.year') }}</el-text>
            <el-input
              v-model="info.year"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('year')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.month') }}</el-text>
            <el-input
              v-model="info.month"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('month')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.day') }}</el-text>
            <el-input
              v-model="info.d"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('d')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.hour') }}</el-text>
            <el-input
              v-model="info.h"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('h')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.minute') }}</el-text>
            <el-input
              v-model="info.min"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('min')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.second') }}</el-text>
            <el-input
              v-model="info.s"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('s')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.ms') }}</el-text>
            <el-input
              v-model="info.ms"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('ms')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.time.week') }}</el-text>
            <el-input
              v-model="info.week"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('week')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

      </div>

      <div class="w-full text-center">
        <el-button type="primary" @click="clear">{{ $t('tools.unit.common.clear') }}</el-button>
      </div>
    </div>
</template>

<style scoped>
.custom-box{
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem/* 12px */;
}
.custom-box-single{
  display: flex;
  width: 50%;
}
.custom-box-text{
  text-align: center;
  width: 10rem;
}
</style>