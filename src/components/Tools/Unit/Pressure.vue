<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const info: {
  [key: string]: string|number
} = reactive({
  pa: '',
  hpa: '',
  kpa: '',
  mpa: '',
  bar: '',
  torr: '',
  psi: '',
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
  //转换成帕
  switch (key) {
    case 'pa':
      info.pa = parseFloat(info[key] as string) * 1
      break;
    case 'hpa':
      info.pa = parseFloat(info[key] as string) * 100
      break;
    case 'kpa':
      info.pa = parseFloat(info[key] as string) * 1000
      break;
    case 'mpa':
      info.pa = parseFloat(info[key] as string) * 1000000
      break;
    case 'bar':
      info.pa = parseFloat(info[key] as string) * 100000
      break;
    case 'torr':
      info.pa = parseFloat(info[key] as string) * 133.322368
      break;
    case 'psi':
      info.pa = parseFloat(info[key] as string) * 6894.76
      break;
    default:
      break;
  }

  //转换成其他单位
  let val = info.pa as number
  info.hpa = val / 100
  info.kpa = val / 1000
  info.mpa = val / 1000000
  info.bar = val / 100000
  info.torr = val / 133.322368
  info.psi = val / 6894.76
}

</script>

<template>
    <div>
      <div>
        <el-divider content-position="left">{{ $t('tools.unit.pressure.title') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.pa') }}</el-text>
            <el-input
              v-model="info.pa"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('pa')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.hpa') }}</el-text>
            <el-input
              v-model="info.hpa"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('hpa')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.kpa') }}</el-text>
            <el-input
              v-model="info.kpa"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('kpa')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.mpa') }}</el-text>
            <el-input
              v-model="info.mpa"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('mpa')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.bar') }}</el-text>
            <el-input
              v-model="info.bar"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('bar')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.torr') }}</el-text>
            <el-input
              v-model="info.torr"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('torr')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.pressure.psi') }}</el-text>
            <el-input
              v-model="info.psi"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('psi')">{{ $t('tools.unit.common.convert') }}</el-button>
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