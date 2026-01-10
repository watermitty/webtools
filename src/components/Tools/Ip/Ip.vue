<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToolsStore } from '@/store/modules/tools'
import { isIp } from '@/utils/verify'
import { ElMessage } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'

const { t } = useI18n()

const info = reactive({
  title: "tools.ip.title",
})

//store
const toolsStore = useToolsStore()
const params = reactive({
  ip: '',
})
//查询
const search = async (type: string) => {
  try {
    //通过点击获取ip信息
    if (type == 'click') {
      //验证是否ip地址
      if (!isIp(params.ip)) {
        ElMessage({
          message: t('tools.ip.msg_invalid_ip'),
          type: "warning",
          duration: 1500
        })
        return
      }
    }
    //获取信息
    await toolsStore.getIp(params)
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  search('')
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div class="flex">
        <div class="mr-2 w-60">
          <el-input v-model="params.ip" :placeholder="$t('tools.ip.placeholder')"></el-input>
        </div>
       
        <el-button type="primary" @click="search('click')">{{ $t('tools.ip.btn_search') }}</el-button>
      </div>
      <div class="mt-3 min-h-md bg-gray-100 p-3 mb-3 flex flex-col">
        <div class="bg-white p-2 font-bold text-xl">{{ $t('tools.ip.label_result') }}</div>
        <div class="bg-white p-2 flex">
          <div class="mr-1">{{ $t('tools.ip.label_isp') }}</div>
          <div>{{ toolsStore.ipData.isp }}</div>
        </div>
        <div class="bg-white p-2 flex">
          <div class="mr-1">{{ $t('tools.ip.label_ip') }}</div>
          <div>{{ toolsStore.ipData.ip }}</div>
        </div>
        <div class="bg-white p-2 flex">
          <div class="mr-1">{{ $t('tools.ip.label_pos') }}</div>
          <div>{{ toolsStore.ipData.pos }}</div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>