<script setup lang="ts">
import { reactive } from 'vue'


const info: {
  [key: string]: string|number
} = reactive({
  w: '',
  mmw: '',
  kw: '',
  mw: '',
  gw: '',
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
//转换成瓦
switch (key) {
    case 'w':
      info.w = parseFloat(info[key] as string) * 1
      break;
    case 'mmw':
      info.w = parseFloat(info[key] as string) * 0.001
      break;
    case 'kw':
      info.w = parseFloat(info[key] as string) * 1000
      break;
    case 'mw':
      info.w = parseFloat(info[key] as string) * 1000000
      break;
    case 'gw':
      info.w = parseFloat(info[key] as string) * 1000000000
      break;
    default:
      break;
  }

  //转换成其他单位
  let val = info.w as number
  info.mmw = val / 0.001
  info.kw = val / 1000
  info.mw = val / 1000000
  info.gw = val / 1000000000
}

</script>

<template>
    <div>
      <div>
        <el-divider content-position="left">{{ $t('tools.unit.power.title') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.power.w') }}</el-text>
            <el-input
              v-model="info.w"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('w')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.power.mw') }}</el-text>
            <el-input
              v-model="info.mw"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('mw')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.power.kw') }}</el-text>
            <el-input
              v-model="info.kw"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('kw')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.power.megaw') }}</el-text>
            <el-input
              v-model="info.megaw"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('megaw')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.power.gw') }}</el-text>
            <el-input
              v-model="info.gw"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('gw')">{{ $t('tools.unit.common.convert') }}</el-button>
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