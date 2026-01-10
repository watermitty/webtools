<script setup lang="ts">
import { reactive } from 'vue'


const lengthInfo: {
  [key: string]: string|number
} = reactive({
  km: '',
  m: '',
  dm: '',
  cm: '',
  mm: '',
  dmm: '',
  um: '',
  nm: '',
  tradition_li: '',
  tradition_zhang: '',
  tradition_chi: '',
  tradition_cun: '',
  tradition_fen: '',
  tradition_mill: '',
  tradition_hao: '',
  eng_nmi: '',
  eng_fm: '',
  eng_mi: '',
  eng_fur: '',
  eng_yd: '',
  eng_ft: '',
  eng_in: '',
})

//clear
const clear = () => {
  for (let item in lengthInfo) {
    lengthInfo[item] = ''
  }
}

/**
 * 转换
 * @param type 
 */
const tran = (key: string) => {
  //转换成米
  switch (key) {
    case 'km':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1000
      break;
    case 'm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'dm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.1
      break;
    case 'cm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.01
      break;
    case 'mm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.001
      break;
    case 'dmm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0001
      break;
    case 'um':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.000001
      break;
    case 'nm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.000000001
      break;
    case 'tradition_li':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 500
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 1500
      break;
    case 'tradition_zhang':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 3.3333333
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 10
      break;
    case 'tradition_chi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.3
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'tradition_cun':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.03
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.1
      break;
    case 'tradition_fen':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.01
      break;
    case 'tradition_mill':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.001
      break;
    case 'tradition_hao':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.00003
      lengthInfo.tradition_chi = parseFloat(lengthInfo[key] as string) * 0.0001
      break;
    case 'eng_nmi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1852
      break;
    case 'eng_fm':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1.852
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 6
      break;
    case 'eng_mi':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 1609.34
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 5280
      break;
    case 'eng_fur':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 201.168
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 660
      break;
    case 'eng_yd':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.9144
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 3
      break;
    case 'eng_ft':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.3048
      lengthInfo.eng_ft = parseFloat(lengthInfo[key] as string) * 1
      break;
    case 'eng_in':
      lengthInfo.m = parseFloat(lengthInfo[key] as string) * 0.0254
      break;
    default:
      break;
  }

  //米转换成其他单位
  let mVal = lengthInfo.m as number
  //中国传统单位处理
  let chiVal = mVal * 3
  if (['tradition_li', 'tradition_zhang', 'tradition_chi', 'tradition_cun', 'tradition_fen', 'tradition_mill', 'tradition_hao'].includes(key)) {
    chiVal =  (lengthInfo.tradition_chi == '' ? chiVal : lengthInfo.tradition_chi) as number
  }
  //英制处理
  let engFtVal = mVal / 0.3048
  if (['eng_fm', 'eng_mi', 'eng_fur', 'eng_yd', 'eng_ft'].includes(key)) {
    engFtVal = (lengthInfo.eng_ft == '' ? mVal / 0.3048 : lengthInfo.eng_ft) as number
  }
  lengthInfo.km = mVal / 1000
  lengthInfo.dm = mVal * 10
  lengthInfo.cm = mVal * 100
  lengthInfo.mm = mVal * 1000
  lengthInfo.dmm = mVal * 10000
  lengthInfo.um = mVal * 1000000
  lengthInfo.nm = mVal * 1000000000
  lengthInfo.tradition_li = mVal / 500
  lengthInfo.tradition_chi = chiVal
  lengthInfo.tradition_zhang = chiVal / 10
  lengthInfo.tradition_cun = chiVal / 0.1
  lengthInfo.tradition_fen = chiVal / 0.01
  lengthInfo.tradition_mill = chiVal / 0.001
  lengthInfo.tradition_hao = chiVal / 0.0001
  lengthInfo.eng_nmi = mVal / 1852
  lengthInfo.eng_ft = engFtVal
  lengthInfo.eng_fm = engFtVal / 6
  lengthInfo.eng_mi = engFtVal / 5280
  lengthInfo.eng_fur = engFtVal / 660
  lengthInfo.eng_yd = engFtVal / 3
  lengthInfo.eng_in = engFtVal * 12
}
</script>

<template>
    <div>
      <div>
        <el-divider content-position="left">{{ $t('tools.unit.length.title_metric') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.km') }}</el-text>
            <el-input
              v-model="lengthInfo.km"
              placeholder=""
              class="input-with-select"
            >
              <template #append>
                <el-button @click="tran('km')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.m') }}</el-text>
            <el-input
              v-model="lengthInfo.m"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('m')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.dm') }}</el-text>
            <el-input
              v-model="lengthInfo.dm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('dm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.cm') }}</el-text>
            <el-input
              v-model="lengthInfo.cm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('cm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.mm') }}</el-text>
            <el-input
              v-model="lengthInfo.mm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('mm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.dmm') }}</el-text>
            <el-input
              v-model="lengthInfo.dmm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('dmm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.um') }}</el-text>
            <el-input
              v-model="lengthInfo.um"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('um')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.nm') }}</el-text>
            <el-input
              v-model="lengthInfo.nm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('nm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <el-divider content-position="left">{{ $t('tools.unit.length.title_chinese') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.li') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_li"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_li')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.zhang') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_zhang"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_zhang')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.chi') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_chi"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_chi')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.cun') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_cun"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_cun')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.fen') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_fen"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_fen')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.mill') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_mill"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_mill')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.hao') }}</el-text>
            <el-input
              v-model="lengthInfo.tradition_hao"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('tradition_hao')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <el-divider content-position="left">{{ $t('tools.unit.length.title_imperial') }}</el-divider>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.nmi') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_nmi"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_nmi')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.fm') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_fm"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_fm')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.mi') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_mi"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_mi')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.fur') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_fur"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_fur')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.yd') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_yd"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_yd')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.ft') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_ft"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_ft')">{{ $t('tools.unit.common.convert') }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <!-- group -->
        <div class="custom-box">
          <div class="custom-box-single">
            <el-text class="custom-box-text">{{ $t('tools.unit.length.in') }}</el-text>
            <el-input
              v-model="lengthInfo.eng_in"
              placeholder=""
              class="input-with-select"
              type="number"
            >
              <template #append>
                <el-button @click="tran('eng_in')">{{ $t('tools.unit.common.convert') }}</el-button>
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
  width: 45%;
}
.custom-box-text{
  text-align: center;
  width: 5rem/* 80px */;
}
</style>