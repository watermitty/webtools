<script setup lang="ts">
import { onMounted, onUnmounted, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VideoPause,VideoPlay,CopyDocument } from '@element-plus/icons-vue'
import { Jh_getTimeStamp,Jh_timeStampToTime,Jh_convertTimeStamp,Jh_getUtcISO8601 } from '@/utils/time'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t } = useI18n()

const info = reactive({
  title: "tools.timetran.title",
  nowTime: Jh_getTimeStamp(),
  nowUtcTime: Jh_getUtcISO8601(), // 新增UTC时间
  isPlay: true,
  waitTimeStamp: Jh_getTimeStamp(),//待转换的时间戳
  tranTimeStamp: 0, //转换后的时间戳
  waitDate: Jh_timeStampToTime(Jh_getTimeStamp(), '{y}-{m}-{d} {h}:{i}:{s}'),  //待转换时间
  tranDate: '', //转换后时间
  chooseTranStampOption: '0',
  chooseTranDateOption: '0',
  tranOptions: computed(() => [
    {
      value: '0',
      label: t('tools.timetran.options.ms')
    },
    {
      value: '1',
      label: t('tools.timetran.options.s')
    }
  ])
})
let timer: any

//开始定时任务
const start = () => {
  if (!timer) {
    timer = setInterval(() => {
      info.nowTime = Jh_getTimeStamp()
      info.nowUtcTime = Jh_getUtcISO8601() // 更新UTC时间
    }, 1000)
  }
}

//停止定时任务
const stop = () => {
  clearInterval(timer)
  timer = null
}

//进入
onMounted(() => {
  start()
})

//消亡
onUnmounted(() => {
  stop()
})


const isPlayChange = () => {
  if (info.isPlay == true) {
    info.isPlay = false
    stop()
  } else {
    info.isPlay = true
    start()

  }
}

//时间日期相互转换
const timeTran = (type: string) => {
  if (type == 'toStamp') {
    info.tranTimeStamp = info.chooseTranStampOption == '0' ? Jh_convertTimeStamp(info.waitDate) : Jh_convertTimeStamp(info.waitDate) / 1000
  } else {
    //转换number类型
    if (typeof(info.waitTimeStamp) === 'string') info.waitTimeStamp = parseInt(info.waitTimeStamp as string)
    info.tranDate = Jh_timeStampToTime(info.waitTimeStamp, '{y}-{m}-{d} {h}:{i}:{s}')
  }
}

//复制时间戳
const copyRes = async () => {
  copy('' + info.nowTime)
}

//复制UTC时间
const copyUtcTime = async () => {
  copy(info.nowUtcTime)
}
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1">
    <DetailHeader :title="$t('tools.timetran.title')"></DetailHeader>
    <div class="flex flex-col p-4 rounded-2xl bg-white">
      <div class="flex flex-direction">
        <el-text class="mr-2 w-12">{{ $t('tools.timetran.ui.now') }}</el-text>
        <el-button class="mr-3" link @click="copyRes()">{{ info.nowTime }} <el-icon class="ml-1 mr-1"><CopyDocument /></el-icon></el-button>
        <el-button v-if="info.isPlay" type="danger" link class="flex items-center" @click="isPlayChange()"><el-icon class="mr-1" size="16"><VideoPlay/></el-icon>{{ $t('tools.timetran.ui.stop') }}</el-button>
        <el-button v-else="info.isPlay" type="primary" link class="flex items-center" @click="isPlayChange()"><el-icon class="mr-1" size="16"><VideoPause /></el-icon>{{ $t('tools.timetran.ui.start') }}</el-button>
      </div>

      <!-- 新增UTC时间显示 -->
      <div class="flex flex-direction mt-2">
        <el-text class="mr-2 w-12">{{ $t('tools.timetran.ui.utc') }}</el-text>
        <el-button class="mr-3" link @click="copyUtcTime()">{{ info.nowUtcTime }} <el-icon class="ml-1 mr-1"><CopyDocument /></el-icon></el-button>
        <el-text class="text-gray-500 text-sm flex items-center">{{ $t('tools.timetran.ui.iso') }}</el-text>
      </div>

      <div class="flex flex-direction mt-4 justify-start">
        <el-text class="mr-2 w-12">{{ $t('tools.timetran.ui.timestamp') }}</el-text>
        <el-input v-model="info.waitTimeStamp" class="h-8 mr-2 w-60 max-w-[30%]" :placeholder="$t('tools.timetran.ui.placeholder_ts')">
        </el-input> 
        <el-button class="mr-2 max-w-[25%]" @click="timeTran('toDate')">{{ $t('tools.timetran.ui.convert') }}</el-button>
        <el-input v-model="info.tranDate" class="h-8 w-72 mr-2 max-w-[30%]" :placeholder="$t('tools.timetran.ui.placeholder_date')"></el-input>
      </div>

      <div class="flex flex-direction mt-4 justify-start">
        <el-text class="mr-2 w-12">{{ $t('tools.timetran.ui.date') }}</el-text>
        <el-input v-model="info.waitDate" class="h-8 mr-2 w-60 max-w-[30%]"></el-input> 
        <el-button class="mr-2 max-w-[25%]" @click="timeTran('toStamp')">{{ $t('tools.timetran.ui.convert') }}</el-button>
        <el-input v-model="info.tranTimeStamp" :value="info.tranTimeStamp == 0 ? '' : info.tranTimeStamp" class="h-8 w-72 mr-2 max-w-[30%]" :placeholder="$t('tools.timetran.ui.timestamp')">
          <template #prepend>
            <el-select v-model="info.chooseTranStampOption" :placeholder="$t('tools.timetran.ui.select')"  class="trantimestamp-select">
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
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.timetran.detail_title')">
      <div class="text-gray-600 leading-7">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.timetran.what_is') }}</h3>
        <p class="mb-4">
          {{ $t('tools.timetran.what_is_content') }}
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.timetran.why_need') }}</h3>
        <p class="mb-4">
          {{ $t('tools.timetran.why_need_content') }}
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.timetran.methods') }}</h3>
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse border border-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="border border-gray-300 px-4 py-2">{{ $t('tools.timetran.table.lang') }}</th>
                <th class="border border-gray-300 px-4 py-2">{{ $t('tools.timetran.table.second') }}</th>
                <th class="border border-gray-300 px-4 py-2">{{ $t('tools.timetran.table.millisecond') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-medium">JavaScript</td>
                <td class="border border-gray-300 px-4 py-2"><code>Math.floor(Date.now() / 1000)</code></td>
                <td class="border border-gray-300 px-4 py-2"><code>Date.now()</code></td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-medium">Python</td>
                <td class="border border-gray-300 px-4 py-2"><code>import time; int(time.time())</code></td>
                <td class="border border-gray-300 px-4 py-2"><code>import time; int(time.time() * 1000)</code></td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-medium">Java</td>
                <td class="border border-gray-300 px-4 py-2"><code>System.currentTimeMillis() / 1000</code></td>
                <td class="border border-gray-300 px-4 py-2"><code>System.currentTimeMillis()</code></td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-medium">PHP</td>
                <td class="border border-gray-300 px-4 py-2"><code>time()</code></td>
                <td class="border border-gray-300 px-4 py-2"><code>microtime(true) * 1000</code></td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2 font-medium">Go</td>
                <td class="border border-gray-300 px-4 py-2"><code>time.Now().Unix()</code></td>
                <td class="border border-gray-300 px-4 py-2"><code>time.Now().UnixMilli()</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.timetran.faq') }}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.timetran.q1') }}</h4>
            <p>{{ $t('tools.timetran.a1') }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.timetran.q2') }}</h4>
            <p>{{ $t('tools.timetran.a2') }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.timetran.q3') }}</h4>
            <p>{{ $t('tools.timetran.a3') }}</p>
          </div>
        </div>
      </div>
    </ToolDetail>

  </div>
</template>

<style scoped>
.trantimestamp-select{
  width: 6rem;
}
</style>