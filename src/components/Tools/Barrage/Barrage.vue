<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import vueDanmaku from 'vue3-danmaku'


const info = reactive({
  content: '工具坊',
  barrage: [] as string[],
  speed: 200,
  textSize: 500,
  textColor: '#FFFFFF',
  bgColor: '#000000',
  channels: 1,
  extraStyle: '',
  danmakuFullStyle: "",
  isPlay: false,
  danmakuFullHeight: '100%',
  danmakuFullWidth: '100%',
})

const danmakuFullRef = ref(null) as any

const fullScreenPlay = () => {
  if (info.isPlay) {
    setExtraStyle('visibility: hidden;')
    danmakuFullRef.value.resize()
    danmakuFullRef.value.stop()
    info.isPlay = false
  } else {
    setExtraStyle()
    formatBarrage()
    danmakuFullRef.value.resize()
    danmakuFullRef.value.play()
    info.isPlay = true
  }
}

const setExtraStyle = (danmakuStyleExt: string = '') => {
  info.extraStyle = "color: " + info.textColor + ";font-size: " + info.textSize + "px"
  info.danmakuFullStyle = "z-index: 99; position: fixed; top: 0px; left: 0px; height:" + info.danmakuFullHeight + "; width:" + info.danmakuFullWidth + "; background-color:" + info.bgColor + ";" + danmakuStyleExt
}

const formatBarrage = () => {
  info.barrage[0] = info.content
}

onBeforeMount(() => {
  setExtraStyle('visibility: hidden;')
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.barrage.title')"></DetailHeader>

    <!-- 全屏 -->
    <vue-danmaku 
      ref="danmakuFullRef" 
      v-model:danmus="info.barrage" 
      loop 
      :autoplay="false"
      :speeds="info.speed"
      :channels="info.channels"
      :extraStyle='info.extraStyle'
      :style="info.danmakuFullStyle"
      @dblclick="fullScreenPlay"
      :useSlot="true"
    >
      <!-- 弹幕slot -->
      <template v-slot:dm="{ danmu }">
        <div class="" :style="info.extraStyle">
          <span>{{ danmu }}</span>
        </div>
      </template>
    </vue-danmaku>

    <div class="p-4 rounded-2xl bg-white">
      <div class="flex mb-2">
        <el-text class="w-20">{{ $t('tools.barrage.content') }}</el-text>
        <div class="w-72"><el-input v-model="info.content" type="textarea" :rows="3"></el-input></div>
      </div>

      <div class="flex mb-2">
        <el-text class="w-20">{{ $t('tools.barrage.speed') }}</el-text>
        <div class="w-72 ml-2"><el-slider v-model="info.speed" :min="1" :max="500"/></div>
      </div>

      <div class="flex mb-2">
        <el-text class="w-20">{{ $t('tools.barrage.text_size') }}</el-text>
        <div class="w-72 ml-2"><el-slider v-model="info.textSize" :min="12" :max="1000"/></div>
      </div>

      <div class="flex mb-2">
        <el-text class="w-20">{{ $t('tools.barrage.text_color') }}</el-text>
        <div><el-color-picker v-model="info.textColor" size="large" @change="setExtraStyle()"/></div>
      </div>

      <div class="flex mb-2">
        <el-text class="w-20">{{ $t('tools.barrage.bg_color') }}</el-text>
        <div><el-color-picker v-model="info.bgColor" size="large" @change="setExtraStyle()"/></div>
      </div>

      <div>
        <el-button @click="fullScreenPlay" type="primary" class="mr-3">{{ info.isPlay == false ? $t('tools.barrage.play') : $t('tools.barrage.pause') }}</el-button>
        <el-text>{{ $t('tools.barrage.exit_hint') }}</el-text>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.barrage.detail_title')">
      <el-text>
        {{ $t('tools.barrage.detail_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
.vue-danmaku .danmus .dm{
  top: 50% !important;
}
</style>