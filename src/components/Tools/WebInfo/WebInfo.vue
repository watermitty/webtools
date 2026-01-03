<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
// import { copy } from '@/utils/string'
import { Jh_getTimeStamp } from '@/utils/time'
import { isUrl } from '@/utils/url'
import { autoDown, getFileExtension } from '@/utils/file'
import { useToolsStore } from '@/store/modules/tools'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const info = reactive({
  title: "tools.webinfo.title",
})

//store
const toolsStore = useToolsStore()

const searchUrl = ref()

const getWebInfo = async () => {
  try {
    if (isUrl(searchUrl.value)) {
      //有效的域名
      if (!searchUrl.value.includes('http://') && !searchUrl.value.includes('https://')) {
        searchUrl.value = 'http://' + searchUrl.value;
      }
      const urlObj = new URL(searchUrl.value)
      // webInfo.link = urlObj.hostname
      searchUrl.value = urlObj.hostname

      await toolsStore.getWebInfo({
        link: searchUrl.value
      })
    } else {
      //无效的域名
      ElMessage({
        message: t('tools.webinfo.invalid_url'),
        type: "error",
        duration: 1500
      })
    }
  } catch (error) {
    console.error('Error fetching site info:', error);  
  }  
};

const down = () => {
  autoDown(toolsStore.webInfo.logo, Jh_getTimeStamp() + '.' + getFileExtension(toolsStore.webInfo.logo))
}

//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div>
        <el-input
          v-model="searchUrl"
          style="max-width: 600px"
          :placeholder="$t('tools.webinfo.placeholder')"
          class="input-with-select"
          size="large"
        >
          <template #append>
            <el-button type="primary" @click="getWebInfo">{{ $t('tools.webinfo.btn_get') }}</el-button>
          </template>
        </el-input>
      </div>
      <div>
        <ul>
          <li class="mt-3">
            <el-text><b>{{ $t('tools.webinfo.label_domain') }}</b></el-text>
            <el-link :href="'https://' + searchUrl" type="primary" target="_blank">{{ searchUrl }}</el-link>
          </li>
          <li class="mt-3 flex">
            <el-text><b>{{ $t('tools.webinfo.label_logo') }}</b></el-text>
            <div v-if="toolsStore.webInfo.logo" class="ml-2 flex items-center">
              <el-image :src="toolsStore.webInfo.logo" class="h-12"></el-image>
              <el-button class="ml-3" link type="primary" @click="down">{{ $t('tools.webinfo.btn_download') }}</el-button>
            </div>
          </li>
          <li class="mt-3 flex">
            <el-text><b>{{ $t('tools.webinfo.label_title') }}</b>{{ toolsStore.webInfo.title }}</el-text>
          </li>
          <li class="mt-3 flex">
            <el-text><b>{{ $t('tools.webinfo.label_keywords') }}</b> {{ toolsStore.webInfo.keywords }}</el-text>
          </li>
          <li class="mt-3 flex">
            <el-text><b>{{ $t('tools.webinfo.label_desc') }}</b> {{ toolsStore.webInfo.desc }}</el-text>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>