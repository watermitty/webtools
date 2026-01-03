<script setup lang="ts">
import { reactive,ref,onMounted } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { CopyDocument } from '@element-plus/icons-vue'
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import labPlugin from 'colord/plugins/lab';
import { useI18n } from 'vue-i18n'

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin, labPlugin]);

const { t } = useI18n()
const info = reactive({
  title: "tools.colorpicker.title",
})

const color = ref('#409eff')
const hex = ref()
const rgb = ref()
const hsl = ref()
const hsv = ref()
const hwb = ref()
const lab = ref()
const lch = ref()
const cmyk = ref()
const name = ref()


const change = () => {
  let colorObj = colord(color.value)
  hex.value = colorObj.toHex()
  rgb.value = colorObj.toRgbString()
  hsl.value = colorObj.toHslString()
  hsv.value = colorObj.toHsv()
  hwb.value = colorObj.toHwbString()
  lab.value = colorObj.toLab()
  lch.value = colorObj.toLchString()
  cmyk.value = colorObj.toCmykString()
  name.value = colorObj.toName({ closest: true }) //{ closest: true } 接近的
  console.log(colorObj.toHslString())
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}


onMounted(() => {
  change()
})

</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white text-center">
      <ul class="w-3/4">
        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">{{ $t('tools.colorpicker.select_color') }}</div>
          <div class="w-full text-left">
            <el-color-picker v-model="color" size="large" @change="change"/>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">Hex:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ hex }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(hex)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">RGB:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ rgb }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(rgb)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">HSL:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ hsl }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(hsl)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">HSV:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ hsv }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(JSON.stringify(hsv))"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">HWB:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ hwb }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(hwb)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">LAB:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ lab }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(JSON.stringify(lab))"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">LCH:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ lch }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(lch)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">CMYK:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ cmyk }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(cmyk)"> </el-button>
            </el-tooltip>
          </div>
        </li>

        <li class='flex items-center mb-3'>
          <div class="w-36 text-right pr-3">Name:</div>
          <div class="w-full pl-3 p-1  text-left bg-[#f5f5fb] flex items-center justify-between">
            <div>
              {{ name }}
            </div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="$t('tools.colorpicker.copy_tooltip')"
              placement="top"
            >
              <el-button :icon="CopyDocument" text bg type="primary" @click="copyRes(name)"> </el-button>
            </el-tooltip>
          </div>
        </li>
      </ul>
    </div>

    <!-- desc -->
		<ToolDetail :title="$t('tools.colorpicker.detail_title')">
			<el-text>
        <span v-html="$t('tools.colorpicker.desc_intro')"></span>
        <div class="indent-8">
          {{ $t('tools.colorpicker.desc_rgb') }}
        </div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_hex')"></div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_hsl')"></div>
        <div class="indent-8">
          {{ $t('tools.colorpicker.desc_hsv') }}
        </div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_hwb')"></div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_lab')"></div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_lch')"></div>
        <div class="indent-8" v-html="$t('tools.colorpicker.desc_cmyk')"></div>
			</el-text> 
		</ToolDetail>

  </div>
</template>

<style scoped>

</style>