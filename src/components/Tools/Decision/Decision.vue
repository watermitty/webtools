<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

const { t } = useI18n()

const info = reactive({
  scope: '',
  randomVal: '',
  checked: '0',
})

const chooseStatus = ref(false)

const changeCheckBox = (val: any) => {
  switch(val) {
    case '0': 
      info.scope = t('tools.decision.default_food')
      break;
    case '1': 
      info.scope = t('tools.decision.default_subject')
      break;
    default:
      info.scope = ''
      break;
  }
}

const init = () => {
  changeCheckBox(info.checked)
}

const choose = () => {
  chooseStatus.value = true
  let count = 0
  let scopeList = info.scope.split(',')
  const chooseInterval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * scopeList.length); 
      info.randomVal = scopeList[randomNum]
      count++
      if (count > 10) {
        clearTimeout(chooseInterval)
        chooseStatus.value = false
      }
  }, 50)
}

const clear = () => {
  info.scope = ''
  info.checked = ''
  info.randomVal = ''
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.decision.title')"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-radio-group v-model="info.checked" @change="changeCheckBox">
          <el-radio label="0" size="large">{{ $t('tools.decision.what_to_eat') }}</el-radio>
          <el-radio label="1" size="large">{{ $t('tools.decision.what_to_do') }}</el-radio>
        </el-radio-group>
      </div>

      <div>
        <el-input type="textarea" v-model="info.scope" :rows="5" :placeholder="$t('tools.decision.placeholder')"></el-input>
      </div>

      <div class="text-5xl h-24 leading-[6rem]" v-if="info.randomVal != ''">
        {{ info.randomVal }}
      </div>

      <div class="mt-3">
        <el-button @click="choose" v-if="!chooseStatus" type="primary">{{ $t('tools.decision.decide') }}</el-button>
        <el-button @click="choose" type="primary" disabled v-else>{{ $t('tools.decision.deciding') }}</el-button>
        <el-button @click="clear">{{ $t('tools.decision.clear') }}</el-button>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.decision.detail_title')">
      <el-text>
        {{ $t('tools.decision.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>