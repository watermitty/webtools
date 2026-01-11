<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { CronExpressionParser } from 'cron-parser'

const { t } = useI18n()

const info = reactive({
  title: "tools.cron.title",
  cronExpression: '',
  cronDescription: '',
  nextExecutions: [] as string[],
  executionCount: 10,
  selectedType: 'second',
  cronConfig: {
    second: {
      type: 'every',
      value: '*',
      start: 0,
      end: 59,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 0, end: 59 }
    },
    minute: {
      type: 'every',
      value: '*',
      start: 0,
      end: 59,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 0, end: 59 }
    },
    hour: {
      type: 'every',
      value: '*',
      start: 0,
      end: 23,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 0, end: 23 }
    },
    day: {
      type: 'every',
      value: '*',
      start: 1,
      end: 31,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 1, end: 31 }
    },
    month: {
      type: 'every',
      value: '*',
      start: 1,
      end: 12,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 1, end: 12 }
    },
    week: {
      type: 'every',
      value: '?',
      start: 1,
      end: 7,
      step: 1,
      specific: [] as number[],
      selectedValues: [] as number[],
      range: { start: 1, end: 7 }
    }
  },
  presetExamples: [
    { name: 'tools.cron.examples.every_sec', cron: '* * * * * ?', desc: 'tools.cron.examples.every_sec_desc' },
    { name: 'tools.cron.examples.every_min', cron: '0 * * * * ?', desc: 'tools.cron.examples.every_min_desc' },
    { name: 'tools.cron.examples.every_hour', cron: '0 0 * * * ?', desc: 'tools.cron.examples.every_hour_desc' },
    { name: 'tools.cron.examples.daily_midnight', cron: '0 0 0 * * ?', desc: 'tools.cron.examples.daily_midnight_desc' },
    { name: 'tools.cron.examples.weekly_monday', cron: '0 0 0 ? * MON', desc: 'tools.cron.examples.weekly_monday_desc' },
    { name: 'tools.cron.examples.monthly_1st', cron: '0 0 0 1 * ?', desc: 'tools.cron.examples.monthly_1st_desc' },
    { name: 'tools.cron.examples.every_5sec', cron: '*/5 * * * * ?', desc: 'tools.cron.examples.every_5sec_desc' },
    { name: 'tools.cron.examples.every_10min', cron: '0 */10 * * * ?', desc: 'tools.cron.examples.every_10min_desc' },
    { name: 'tools.cron.examples.every_2hour', cron: '0 0 */2 * * ?', desc: 'tools.cron.examples.every_2hour_desc' },
    { name: 'tools.cron.examples.time_range', cron: '* * 1-2 * * ?', desc: 'tools.cron.examples.time_range_desc' },
    { name: 'tools.cron.examples.multi_times', cron: '0 0 8,12,18 * * ?', desc: 'tools.cron.examples.multi_times_desc' },
    { name: 'tools.cron.examples.workday', cron: '0 0 9 ? * MON-FRI', desc: 'tools.cron.examples.workday_desc' }
  ]
})

// 鎵嬫満绔疶ab鐩稿叧
const currentTabIndex = ref(0)
const tabList = [
  { name: 'second', label: 'tools.cron.unit.second' },
  { name: 'minute', label: 'tools.cron.unit.minute' },
  { name: 'hour', label: 'tools.cron.unit.hour' },
  { name: 'day', label: 'tools.cron.unit.day' },
  { name: 'month', label: 'tools.cron.unit.month' },
  { name: 'week', label: 'tools.cron.unit.week' }
]

// 浣跨敤cron-parser璁＄畻鏈€杩戞墽琛屾椂闂?
const calculateNextExecutions = () => {
  if (!info.cronExpression) {
    info.nextExecutions = []
    return
  }
  
  try {
    const interval = CronExpressionParser.parse(info.cronExpression)
    const executions: string[] = []
    
    for (let i = 0; i < info.executionCount; i++) {
      const next = interval.next()
      const date = next.toDate()
      const weekdays = t('tools.cron.week_days_short')
      const weekday = weekdays[date.getDay()]
      const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')} (${weekday})`
      executions.push(formatted)
    }
    
    info.nextExecutions = executions
  } catch (error) {
    console.error('Cron琛ㄨ揪寮忚В鏋愰敊璇?', error)
    info.nextExecutions = []
  }
}

// 鐢熸垚cron琛ㄨ揪寮?
const generateCron = () => {
  const config = info.cronConfig
  const cron = [
    config.second.value,
    config.minute.value,
    config.hour.value,
    config.day.value,
    config.month.value,
    config.week.value
  ].join(' ')
  
  info.cronExpression = cron
  generateDescription()
  calculateNextExecutions()
}

// 鐢熸垚鎻忚堪
const generateDescription = () => {
  const parts = info.cronExpression.split(' ')
  let desc = t('tools.cron.meaning_prefix')
  
  // 绉?
  if (parts[0] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.second')
  } else if (parts[0].includes('/')) {
    const step = parts[0].split('/')[1]
    desc += t('tools.cron.every') + step + t('tools.cron.unit.second')
  } else if (parts[0] === '0') {
    desc += t('tools.cron.at') + '0 ' + t('tools.cron.unit.second')
  } else {
    desc += t('tools.cron.at') + parts[0] + ' ' + t('tools.cron.unit.second')
  }
  
  // 鍒?
  if (parts[1] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.minute')
  } else if (parts[1].includes('/')) {
    const step = parts[1].split('/')[1]
    desc += t('tools.cron.every') + step + t('tools.cron.unit.minute')
  } else if (parts[1] === '0') {
    desc += t('tools.cron.at') + '0 ' + t('tools.cron.unit.minute')
  } else {
    desc += t('tools.cron.at') + parts[1] + ' ' + t('tools.cron.unit.minute')
  }
  
  // 鏃?
  if (parts[2] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.hour')
  } else if (parts[2].includes('/')) {
    const step = parts[2].split('/')[1]
    desc += t('tools.cron.every') + step + t('tools.cron.unit.hour')
  } else if (parts[2] === '0') {
    desc += t('tools.cron.at') + '0 ' + t('tools.cron.unit.hour')
  } else {
    desc += t('tools.cron.at') + parts[2] + ' ' + t('tools.cron.unit.hour')
  }
  
  // 鏃?
  if (parts[3] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.day')
  } else if (parts[3].includes('/')) {
    const step = parts[3].split('/')[1]
    desc += t('tools.cron.every') + step + t('tools.cron.unit.day')
  } else if (parts[3] === '1') {
    desc += t('tools.cron.at') + '1 ' + t('tools.cron.unit.day')
  } else {
    desc += t('tools.cron.at') + parts[3] + ' ' + t('tools.cron.unit.day')
  }
  
  // 鏈?
  if (parts[4] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.month')
  } else if (parts[4].includes('/')) {
    const step = parts[4].split('/')[1]
    desc += t('tools.cron.every') + step + t('tools.cron.unit.month')
  } else if (parts[4] === '1') {
    desc += t('tools.cron.at') + '1 ' + t('tools.cron.unit.month')
  } else {
    desc += t('tools.cron.at') + parts[4] + ' ' + t('tools.cron.unit.month')
  }
  
  // 鍛?
  if (parts[5] === '?') {
    desc += ''
  } else if (parts[5] === 'MON') {
    desc += t('tools.cron.at') + t('tools.cron.week_days_full')[1]
  } else if (parts[5] === '*') {
    desc += t('tools.cron.every') + t('tools.cron.unit.week')
  } else {
    desc += t('tools.cron.at') + t('tools.cron.unit.week') + parts[5]
  }
  
  desc += t('tools.cron.execute')
  info.cronDescription = desc
}

// 鏇存柊閰嶇疆鍑芥暟锛屼慨澶嶇被鍨嬮棶棰?
const updateConfig = (field: string, type: string, value: any) => {
  const config = info.cronConfig[field as keyof typeof info.cronConfig]
  if (config) {
    config.type = type
    if (type === 'specific') {
      if (config.selectedValues.length > 0) {
        config.value = config.selectedValues.join(',')
      } else {
        config.value = '*'
      }
    } else if (type === 'range') {
      const range = config.range
      config.value = `${range.start}-${range.end}`
    } else if (type === 'step') {
      config.value = `*/${config.step}`
    } else {
      config.value = value
    }
    generateCron()
  }
}

// 澶勭悊闂撮殧鑼冨洿鍙樺寲
const handleRangeStartChange = (field: string) => {
  const config = info.cronConfig[field as keyof typeof info.cronConfig]
  if (config && config.type === 'range') {
    const range = config.range
    
    if (range.start > range.end) {
      range.end = range.start
    }
    
    config.value = `${range.start}-${range.end}`
    generateCron()
  }
}

const handleRangeEndChange = (field: string) => {
  const config = info.cronConfig[field as keyof typeof info.cronConfig]
  if (config && config.type === 'range') {
    const range = config.range
    
    if (range.end < range.start) {
      range.start = range.end
    }
    
    config.value = `${range.start}-${range.end}`
    generateCron()
  }
}

// 澶勭悊澶氶€夊€煎彉鍖?
const handleMultiSelectChange = (field: string, values: any[]) => {
  const config = info.cronConfig[field as keyof typeof info.cronConfig]
  if (config) {
    config.selectedValues = values
    config.value = values.join(',')
    generateCron()
  }
}

// 浣跨敤棰勮
const usePreset = (cron: string) => {
  info.cronExpression = cron
  parseCronToConfig(cron)
  generateDescription()
  calculateNextExecutions()
}

// 澶嶅埗缁撴灉
const copyResult = async () => {
  if (info.cronExpression) {
    await copy(info.cronExpression)
  }
}

// 澶勭悊Cron琛ㄨ揪寮忚緭鍏?
const onCronInput = () => {
  parseCronToConfig(info.cronExpression)
  generateDescription()
  calculateNextExecutions()
}

// 瑙ｆ瀽Cron琛ㄨ揪寮忓埌閰嶇疆椤?
const parseCronToConfig = (cronExpression: string) => {
  const parts = cronExpression.split(' ')
  if (parts.length < 6) return
  
  const [second, minute, hour, day, month, weekday] = parts
  
  // 瑙ｆ瀽绉?
  if (second === '*') {
    info.cronConfig.second.type = 'every'
    info.cronConfig.second.value = '*'
    info.cronConfig.second.selectedValues = []
    info.cronConfig.second.range = { start: 0, end: 59 }
  } else if (second.includes('/')) {
    const step = second.split('/')[1]
    info.cronConfig.second.type = 'step'
    info.cronConfig.second.step = parseInt(step)
    info.cronConfig.second.value = second
    info.cronConfig.second.selectedValues = []
    info.cronConfig.second.range = { start: 0, end: 59 }
  } else if (second.includes(',')) {
    info.cronConfig.second.type = 'specific'
    const values = second.split(',').map(v => parseInt(v))
    info.cronConfig.second.selectedValues = values
    info.cronConfig.second.value = second
    info.cronConfig.second.range = { start: 0, end: 59 }
  } else if (second.includes('-')) {
    info.cronConfig.second.type = 'range'
    const [start, end] = second.split('-').map(v => parseInt(v))
    info.cronConfig.second.range = { start, end }
    info.cronConfig.second.value = second
    info.cronConfig.second.selectedValues = []
  } else {
    info.cronConfig.second.type = 'specific'
    info.cronConfig.second.selectedValues = [parseInt(second)]
    info.cronConfig.second.value = second
    info.cronConfig.second.range = { start: 0, end: 59 }
  }
  
  // 瑙ｆ瀽鍒?
  if (minute === '*') {
    info.cronConfig.minute.type = 'every'
    info.cronConfig.minute.value = '*'
    info.cronConfig.minute.selectedValues = []
    info.cronConfig.minute.range = { start: 0, end: 59 }
  } else if (minute.includes('/')) {
    const step = minute.split('/')[1]
    info.cronConfig.minute.type = 'step'
    info.cronConfig.minute.step = parseInt(step)
    info.cronConfig.minute.value = minute
    info.cronConfig.minute.selectedValues = []
    info.cronConfig.minute.range = { start: 0, end: 59 }
  } else if (minute.includes(',')) {
    info.cronConfig.minute.type = 'specific'
    const values = minute.split(',').map(v => parseInt(v))
    info.cronConfig.minute.selectedValues = values
    info.cronConfig.minute.value = minute
    info.cronConfig.minute.range = { start: 0, end: 59 }
  } else if (minute.includes('-')) {
    info.cronConfig.minute.type = 'range'
    const [start, end] = minute.split('-').map(v => parseInt(v))
    info.cronConfig.minute.range = { start, end }
    info.cronConfig.minute.value = minute
    info.cronConfig.minute.selectedValues = []
  } else {
    info.cronConfig.minute.type = 'specific'
    info.cronConfig.minute.selectedValues = [parseInt(minute)]
    info.cronConfig.minute.value = minute
    info.cronConfig.minute.range = { start: 0, end: 59 }
  }
  
  // 瑙ｆ瀽鏃?
  if (hour === '*') {
    info.cronConfig.hour.type = 'every'
    info.cronConfig.hour.value = '*'
    info.cronConfig.hour.selectedValues = []
    info.cronConfig.hour.range = { start: 0, end: 23 }
  } else if (hour.includes('/')) {
    const step = hour.split('/')[1]
    info.cronConfig.hour.type = 'step'
    info.cronConfig.hour.step = parseInt(step)
    info.cronConfig.hour.value = hour
    info.cronConfig.hour.selectedValues = []
    info.cronConfig.hour.range = { start: 0, end: 23 }
  } else if (hour.includes(',')) {
    info.cronConfig.hour.type = 'specific'
    const values = hour.split(',').map(v => parseInt(v))
    info.cronConfig.hour.selectedValues = values
    info.cronConfig.hour.value = hour
    info.cronConfig.hour.range = { start: 0, end: 23 }
  } else if (hour.includes('-')) {
    info.cronConfig.hour.type = 'range'
    const [start, end] = hour.split('-').map(v => parseInt(v))
    info.cronConfig.hour.range = { start, end }
    info.cronConfig.hour.value = hour
    info.cronConfig.hour.selectedValues = []
  } else {
    info.cronConfig.hour.type = 'specific'
    info.cronConfig.hour.selectedValues = [parseInt(hour)]
    info.cronConfig.hour.value = hour
    info.cronConfig.hour.range = { start: 0, end: 23 }
  }
  
  // 瑙ｆ瀽鏃?
  if (day === '*') {
    info.cronConfig.day.type = 'every'
    info.cronConfig.day.value = '*'
    info.cronConfig.day.selectedValues = []
    info.cronConfig.day.range = { start: 1, end: 31 }
  } else if (day.includes('/')) {
    const step = day.split('/')[1]
    info.cronConfig.day.type = 'step'
    info.cronConfig.day.step = parseInt(step)
    info.cronConfig.day.value = day
    info.cronConfig.day.selectedValues = []
    info.cronConfig.day.range = { start: 1, end: 31 }
  } else if (day.includes(',')) {
    info.cronConfig.day.type = 'specific'
    const values = day.split(',').map(v => parseInt(v))
    info.cronConfig.day.selectedValues = values
    info.cronConfig.day.value = day
    info.cronConfig.day.range = { start: 1, end: 31 }
  } else if (day.includes('-')) {
    info.cronConfig.day.type = 'range'
    const [start, end] = day.split('-').map(v => parseInt(v))
    info.cronConfig.day.range = { start, end }
    info.cronConfig.day.value = day
    info.cronConfig.day.selectedValues = []
  } else {
    info.cronConfig.day.type = 'specific'
    info.cronConfig.day.selectedValues = [parseInt(day)]
    info.cronConfig.day.value = day
    info.cronConfig.day.range = { start: 1, end: 31 }
  }
  
  // 瑙ｆ瀽鏈?
  if (month === '*') {
    info.cronConfig.month.type = 'every'
    info.cronConfig.month.value = '*'
    info.cronConfig.month.selectedValues = []
    info.cronConfig.month.range = { start: 1, end: 12 }
  } else if (month.includes('/')) {
    const step = month.split('/')[1]
    info.cronConfig.month.type = 'step'
    info.cronConfig.month.step = parseInt(step)
    info.cronConfig.month.value = month
    info.cronConfig.month.selectedValues = []
    info.cronConfig.month.range = { start: 1, end: 12 }
  } else if (month.includes(',')) {
    info.cronConfig.month.type = 'specific'
    const values = month.split(',').map(v => parseInt(v))
    info.cronConfig.month.selectedValues = values
    info.cronConfig.month.value = month
    info.cronConfig.month.range = { start: 1, end: 12 }
  } else if (month.includes('-')) {
    info.cronConfig.month.type = 'range'
    const [start, end] = month.split('-').map(v => parseInt(v))
    info.cronConfig.month.range = { start, end }
    info.cronConfig.month.value = month
    info.cronConfig.month.selectedValues = []
  } else {
    info.cronConfig.month.type = 'specific'
    info.cronConfig.month.selectedValues = [parseInt(month)]
    info.cronConfig.month.value = month
    info.cronConfig.month.range = { start: 1, end: 12 }
  }
  
  // 瑙ｆ瀽鍛?
  if (weekday === '?') {
    info.cronConfig.week.type = 'every'
    info.cronConfig.week.value = '?'
    info.cronConfig.week.selectedValues = []
    info.cronConfig.week.range = { start: 1, end: 7 }
  } else if (weekday === '*') {
    info.cronConfig.week.type = 'every'
    info.cronConfig.week.value = '*'
    info.cronConfig.week.selectedValues = []
    info.cronConfig.week.range = { start: 1, end: 7 }
  } else if (weekday.includes(',')) {
    info.cronConfig.week.type = 'specific'
    const values = weekday.split(',').map(v => parseInt(v))
    info.cronConfig.week.selectedValues = values
    info.cronConfig.week.value = weekday
    info.cronConfig.week.range = { start: 1, end: 7 }
  } else if (weekday.includes('-')) {
    info.cronConfig.week.type = 'range'
    const [start, end] = weekday.split('-').map(v => parseInt(v))
    info.cronConfig.week.range = { start, end }
    info.cronConfig.week.value = weekday
    info.cronConfig.week.selectedValues = []
  } else {
    info.cronConfig.week.type = 'specific'
    info.cronConfig.week.selectedValues = [parseInt(weekday)]
    info.cronConfig.week.value = weekday
    info.cronConfig.week.range = { start: 1, end: 7 }
  }
}

// 鍒濆鍖?
generateCron()
</script>

<template>

    <div class="flex flex-col mt-3 flex-1">
      <DetailHeader :title="$t(info.title)"></DetailHeader>
  
      <!-- 鑷畾涔夐厤缃尯锛屼娇鐢═ab鍒囨崲 -->
      <div class="p-4 rounded-2xl bg-white mb-6">
        <el-text class="font-bold text-lg mb-3 block">{{ $t('tools.cron.config_title') }}</el-text>
        
        <!-- 妗岄潰绔樉绀哄畬鏁磘abs -->
        <div class="hidden md:block">
          <el-tabs 
            v-model="info.selectedType" 
            type="card"
            class="custom-tabs"
          >
            <el-tab-pane :label="$t('tools.cron.unit.second')" name="second">
              <el-radio-group v-model="info.cronConfig.second.type" @change="(val) => updateConfig('second', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾绉掗厤缃?-->
              <div v-if="info.cronConfig.second.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.second').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.second.selectedValues"
                  @change="handleMultiSelectChange('second', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 60" 
                    :key="i - 1" 
                    :label="i - 1"
                    class="w-16"
                  >
                    {{ i - 1 }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧绉掗厤缃?-->
              <div v-if="info.cronConfig.second.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.second.step" 
                  :min="1" 
                  :max="59"
                  @change="updateConfig('second', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.second') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.second.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.second.range.start" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeStartChange('second')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.second.range.end" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeEndChange('second')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.minute')" name="minute">
              <el-radio-group v-model="info.cronConfig.minute.type" @change="(val) => updateConfig('minute', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鍒嗛厤缃?-->
              <div v-if="info.cronConfig.minute.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.minute').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.minute.selectedValues"
                  @change="handleMultiSelectChange('minute', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 60" 
                    :key="i - 1" 
                    :label="i - 1"
                    class="w-16"
                  >
                    {{ i - 1 }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鍒嗛厤缃?-->
              <div v-if="info.cronConfig.minute.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.minute.step" 
                  :min="1" 
                  :max="59"
                  @change="updateConfig('minute', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.minute') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.minute.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.minute.range.start" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeStartChange('minute')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.minute.range.end" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeEndChange('minute')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.hour')" name="hour">
              <el-radio-group v-model="info.cronConfig.hour.type" @change="(val) => updateConfig('hour', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏃堕厤缃?-->
              <div v-if="info.cronConfig.hour.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.hour').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.hour.selectedValues"
                  @change="handleMultiSelectChange('hour', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 24" 
                    :key="i - 1" 
                    :label="i - 1"
                    class="w-16"
                  >
                    {{ i - 1 }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏃堕厤缃?-->
              <div v-if="info.cronConfig.hour.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.hour.step" 
                  :min="1" 
                  :max="23"
                  @change="updateConfig('hour', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.hour') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.hour.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.hour.range.start" 
                      :min="0" 
                      :max="23"
                      @change="handleRangeStartChange('hour')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.hour.range.end" 
                      :min="0" 
                      :max="23"
                      @change="handleRangeEndChange('hour')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.day')" name="day">
              <el-radio-group v-model="info.cronConfig.day.type" @change="(val) => updateConfig('day', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏃ラ厤缃?-->
              <div v-if="info.cronConfig.day.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.day').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.day.selectedValues"
                  @change="handleMultiSelectChange('day', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 31" 
                    :key="i" 
                    :label="i"
                    class="w-16"
                  >
                    {{ i }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏃ラ厤缃?-->
              <div v-if="info.cronConfig.day.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.day.step" 
                  :min="1" 
                  :max="31"
                  @change="updateConfig('day', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.day') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.day.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.day.range.start" 
                      :min="1" 
                      :max="31"
                      @change="handleRangeStartChange('day')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.day.range.end" 
                      :min="1" 
                      :max="31"
                      @change="handleRangeEndChange('day')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.month')" name="month">
              <el-radio-group v-model="info.cronConfig.month.type" @change="(val) => updateConfig('month', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.month').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.month.selectedValues"
                  @change="handleMultiSelectChange('month', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 12" 
                    :key="i" 
                    :label="i"
                    class="w-16"
                  >
                    {{ i }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.month.step" 
                  :min="1" 
                  :max="12"
                  @change="updateConfig('month', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.month') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.month.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.start" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeStartChange('month')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.end" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeEndChange('month')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.month')" name="month">
              <el-radio-group v-model="info.cronConfig.month.type" @change="(val) => updateConfig('month', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.month').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.month.selectedValues"
                  @change="handleMultiSelectChange('month', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 12" 
                    :key="i" 
                    :label="i"
                    class="w-16"
                  >
                    {{ i }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.month.step" 
                  :min="1" 
                  :max="12"
                  @change="updateConfig('month', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.month') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.month.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.start" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeStartChange('month')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.end" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeEndChange('month')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('tools.cron.unit.week')" name="week">
              <el-radio-group v-model="info.cronConfig.week.type" @change="(val) => updateConfig('week', typeof val === 'string' ? val : 'every', '?')">
                <el-radio value="every">{{ $t('tools.cron.type.none') }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.week') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏄熸湡閰嶇疆 -->
              <div v-if="info.cronConfig.week.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.week').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.week.selectedValues"
                  @change="handleMultiSelectChange('week', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox label="SUN">{{ $t('tools.cron.week_days_short')[0] }}</el-checkbox>
                  <el-checkbox label="MON">{{ $t('tools.cron.week_days_short')[1] }}</el-checkbox>
                  <el-checkbox label="TUE">{{ $t('tools.cron.week_days_short')[2] }}</el-checkbox>
                  <el-checkbox label="WED">{{ $t('tools.cron.week_days_short')[3] }}</el-checkbox>
                  <el-checkbox label="THU">{{ $t('tools.cron.week_days_short')[4] }}</el-checkbox>
                  <el-checkbox label="FRI">{{ $t('tools.cron.week_days_short')[5] }}</el-checkbox>
                  <el-checkbox label="SAT">{{ $t('tools.cron.week_days_short')[6] }}</el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.week.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.week.range.start" 
                      :min="1" 
                      :max="7"
                      @change="handleRangeStartChange('week')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.week.range.end" 
                      :min="1" 
                      :max="7"
                      @change="handleRangeEndChange('week')"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <!-- 鎵嬫満绔樉绀烘粦鍔╰abs -->
        <div class="block md:hidden">
          <div class="flex justify-between items-center mb-3">
            <el-button 
              :disabled="currentTabIndex === 0"
              @click="currentTabIndex--"
              size="small"
            >
              {{ $t('tools.cron.prev_tab') }}
            </el-button>
            <el-text class="text-sm">{{ currentTabIndex + 1 }} / {{ tabList.length }}</el-text>
            <el-button 
              :disabled="currentTabIndex === tabList.length - 1"
              @click="currentTabIndex++"
              size="small"
            >
              {{ $t('tools.cron.next_tab') }}
            </el-button>
          </div>
          
          <el-tabs v-model="info.selectedType" type="card">
            <el-tab-pane 
              v-for="tab in tabList"
              :key="tab.name"
              :label="tab.label" 
              :name="tab.name"
            >
              <div v-if="tab.name === 'second'">
                <el-radio-group v-model="info.cronConfig.second.type" @change="(val) => updateConfig('second', typeof val === 'string' ? val : 'every', '*')">
                  <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                  <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                  <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.second') }) }}</el-radio>
                  <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
                </el-radio-group>
                
                <!-- 鎸囧畾绉掗厤缃?-->
                <div v-if="info.cronConfig.second.type === 'specific'" class="mt-3">
                  <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.second').toLowerCase() }) }}</el-text>
                  <el-checkbox-group 
                    v-model="info.cronConfig.second.selectedValues"
                    @change="handleMultiSelectChange('second', $event)"
                    class="flex flex-wrap gap-2"
                  >
                    <el-checkbox 
                      v-for="i in 60" 
                      :key="i - 1" 
                      :label="i - 1"
                      class="w-16"
                    >
                      {{ i - 1 }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                
                <!-- 闂撮殧绉掗厤缃?-->
                <div v-if="info.cronConfig.second.type === 'step'" class="mt-3">
                  <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                  <el-input-number 
                    v-model="info.cronConfig.second.step" 
                    :min="1" 
                    :max="59"
                    @change="updateConfig('second', 'step', '*')"
                  />
                  <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.second') }) }}</el-text>
                </div>
                
                <!-- 闂撮殧鑼冨洿閰嶇疆 -->
                <div v-if="info.cronConfig.second.type === 'range'" class="mt-3">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                      <el-input-number 
                        v-model="info.cronConfig.second.range.start" 
                        :min="0" 
                        :max="59"
                        @change="handleRangeStartChange('second')"
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                      <el-input-number 
                        v-model="info.cronConfig.second.range.end" 
                        :min="0" 
                        :max="59"
                        @change="handleRangeEndChange('second')"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else-if="tab.name === 'minute'">
                <el-radio-group v-model="info.cronConfig.minute.type" @change="(val) => updateConfig('minute', typeof val === 'string' ? val : 'every', '*')">
                  <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                  <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                  <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.minute') }) }}</el-radio>
                  <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
                </el-radio-group>
                
                <!-- 鎸囧畾鍒嗛厤缃?-->
                <div v-if="info.cronConfig.minute.type === 'specific'" class="mt-3">
                  <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.minute').toLowerCase() }) }}</el-text>
                  <el-checkbox-group 
                    v-model="info.cronConfig.minute.selectedValues"
                    @change="handleMultiSelectChange('minute', $event)"
                    class="flex flex-wrap gap-2"
                  >
                    <el-checkbox 
                      v-for="i in 60" 
                      :key="i - 1" 
                      :label="i - 1"
                      class="w-16"
                    >
                      {{ i - 1 }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                
                <!-- 闂撮殧鍒嗛厤缃?-->
                <div v-if="info.cronConfig.minute.type === 'step'" class="mt-3">
                  <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                  <el-input-number 
                    v-model="info.cronConfig.minute.step"                   :min="1" 
                  :max="59"
                  @change="updateConfig('minute', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.minute') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.minute.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.minute.range.start" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeStartChange('minute')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.minute.range.end" 
                      :min="0" 
                      :max="59"
                      @change="handleRangeEndChange('minute')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="tab.name === 'hour'">
              <el-radio-group v-model="info.cronConfig.hour.type" @change="(val) => updateConfig('hour', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.hour') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏃堕厤缃?-->
              <div v-if="info.cronConfig.hour.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.hour').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.hour.selectedValues"
                  @change="handleMultiSelectChange('hour', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 24" 
                    :key="i - 1" 
                    :label="i - 1"
                    class="w-16"
                  >
                    {{ i - 1 }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏃堕厤缃?-->
              <div v-if="info.cronConfig.hour.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.hour.step" 
                  :min="1" 
                  :max="23"
                  @change="updateConfig('hour', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.hour') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.hour.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.hour.range.start" 
                      :min="0" 
                      :max="23"
                      @change="handleRangeStartChange('hour')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.hour.range.end" 
                      :min="0" 
                      :max="23"
                      @change="handleRangeEndChange('hour')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="tab.name === 'day'">
              <el-radio-group v-model="info.cronConfig.day.type" @change="(val) => updateConfig('day', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.day') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏃ラ厤缃?-->
              <div v-if="info.cronConfig.day.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.day').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.day.selectedValues"
                  @change="handleMultiSelectChange('day', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 31" 
                    :key="i" 
                    :label="i"
                    class="w-16"
                  >
                    {{ i }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏃ラ厤缃?-->
              <div v-if="info.cronConfig.day.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.day.step" 
                  :min="1" 
                  :max="31"
                  @change="updateConfig('day', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.day') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.day.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.day.range.start" 
                      :min="1" 
                      :max="31"
                      @change="handleRangeStartChange('day')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.day.range.end" 
                      :min="1" 
                      :max="31"
                      @change="handleRangeEndChange('day')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="tab.name === 'month'">
              <el-radio-group v-model="info.cronConfig.month.type" @change="(val) => updateConfig('month', typeof val === 'string' ? val : 'every', '*')">
                <el-radio value="every">{{ $t('tools.cron.type.every', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="step">{{ $t('tools.cron.type.step', { unit: t('tools.cron.unit.month') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.month').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.month.selectedValues"
                  @change="handleMultiSelectChange('month', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox 
                    v-for="i in 12" 
                    :key="i" 
                    :label="i"
                    class="w-16"
                  >
                    {{ i }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鏈堥厤缃?-->
              <div v-if="info.cronConfig.month.type === 'step'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.step_label_prefix') }}</el-text>
                <el-input-number 
                  v-model="info.cronConfig.month.step" 
                  :min="1" 
                  :max="12"
                  @change="updateConfig('month', 'step', '*')"
                />
                <el-text class="text-sm text-gray-600">{{ $t('tools.cron.step_label_suffix', { unit: t('tools.cron.unit.month') }) }}</el-text>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.month.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.start" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeStartChange('month')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.month.range.end" 
                      :min="1" 
                      :max="12"
                      @change="handleRangeEndChange('month')"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="tab.name === 'week'">
              <el-radio-group v-model="info.cronConfig.week.type" @change="(val) => updateConfig('week', typeof val === 'string' ? val : 'every', '?')">
                <el-radio value="every">{{ $t('tools.cron.type.none') }}</el-radio>
                <el-radio value="specific">{{ $t('tools.cron.type.specific', { unit: t('tools.cron.unit.week') }) }}</el-radio>
                <el-radio value="range">{{ $t('tools.cron.type.range') }}</el-radio>
              </el-radio-group>
              
              <!-- 鎸囧畾鏄熸湡閰嶇疆 -->
              <div v-if="info.cronConfig.week.type === 'specific'" class="mt-3">
                <el-text class="text-sm text-gray-600 mb-2 block">{{ $t('tools.cron.specific_label', { unit: t('tools.cron.unit.week').toLowerCase() }) }}</el-text>
                <el-checkbox-group 
                  v-model="info.cronConfig.week.selectedValues"
                  @change="handleMultiSelectChange('week', $event)"
                  class="flex flex-wrap gap-2"
                >
                  <el-checkbox label="SUN">{{ t('tools.cron.week_days_short_list')[0] }}</el-checkbox>
                  <el-checkbox label="MON">{{ t('tools.cron.week_days_short_list')[1] }}</el-checkbox>
                  <el-checkbox label="TUE">{{ t('tools.cron.week_days_short_list')[2] }}</el-checkbox>
                  <el-checkbox label="WED">{{ t('tools.cron.week_days_short_list')[3] }}</el-checkbox>
                  <el-checkbox label="THU">{{ t('tools.cron.week_days_short_list')[4] }}</el-checkbox>
                  <el-checkbox label="FRI">{{ t('tools.cron.week_days_short_list')[5] }}</el-checkbox>
                  <el-checkbox label="SAT">{{ t('tools.cron.week_days_short_list')[6] }}</el-checkbox>
                </el-checkbox-group>
              </div>
              
              <!-- 闂撮殧鑼冨洿閰嶇疆 -->
              <div v-if="info.cronConfig.week.type === 'range'" class="mt-3">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_from') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.week.range.start" 
                      :min="1" 
                      :max="7"
                      @change="handleRangeStartChange('week')"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <el-text>{{ $t('tools.cron.range_to') }}</el-text>
                    <el-input-number 
                      v-model="info.cronConfig.week.range.end" 
                      :min="1" 
                      :max="7"
                      @change="handleRangeEndChange('week')"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 缁撴灉鍖哄煙 -->
    <div class="p-4 rounded-2xl bg-white mb-6">
      <el-text class="font-bold text-lg mb-3 block">{{ $t('tools.cron.result_title') }}</el-text>
      <div class="flex items-center gap-3 mb-3">
        <el-input 
          v-model="info.cronExpression" 
          class="flex-1"
          :placeholder="$t('tools.cron.placeholder')"
          @input="onCronInput"
        />
        <el-button type="primary" @click="copyResult">{{ $t('tools.cron.btn_copy') }}</el-button>
      </div>
      
      <!-- 鎵ц娆℃暟閰嶇疆 -->
      <div class="flex items-center gap-3 mb-3">
        <el-text>{{ $t('tools.cron.exec_count_label') }}</el-text>
        <el-input-number 
          v-model="info.executionCount" 
          :min="1" 
          :max="200"
          @change="calculateNextExecutions"
        />
        <el-text>{{ $t('tools.cron.exec_count_suffix') }}</el-text>
      </div>
      
      <el-text class="text-sm text-gray-600 mb-3 block">{{ info.cronDescription }}</el-text>
      
      <div v-if="info.nextExecutions.length > 0">
        <el-text class="font-bold text-lg mb-3 block">{{ $t('tools.cron.next_exec_title', { count: info.executionCount }) }}</el-text>
        <div class="space-y-2">
          <div 
            v-for="(execution, index) in info.nextExecutions" 
            :key="index"
            class="p-2 bg-gray-50 rounded"
          >
            {{ index + 1 }}. {{ execution }}
          </div>
        </div>
      </div>
    </div>

    <!-- 棰勮绀轰緥 -->
    <div class="mb-6">
      <el-text class="font-bold text-lg mb-3 block">{{ $t('tools.cron.examples_title') }}</el-text>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <el-card 
          v-for="(example, index) in info.presetExamples" 
          :key="index"
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="usePreset(example.cron)"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">{{ $t(example.name) }}</span>
            </div>
          </template>
          <div class="text-sm text-gray-600 mb-2">{{ $t(example.desc) }}</div>
          <div class="text-xs text-gray-500 font-mono">{{ example.cron }}</div>
        </el-card>
      </div>
    </div>

    <!-- 浣跨敤鏂囨。 -->
    <div class="mb-6">
      <el-text class="font-bold text-lg mb-3 block">{{ $t('tools.cron.usage_title') }}</el-text>
      <div class="space-y-4 text-sm text-gray-700">
        <div>
          <h4 class="font-bold mb-2">{{ $t('tools.cron.usage.format_title') }}</h4>
          <p class="mb-2">{{ $t('tools.cron.usage.format_desc') }}</p>
          <p class="text-xs text-gray-500">{{ $t('tools.cron.usage.format_example') }}</p>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">{{ $t('tools.cron.usage.char_title') }}</h4>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li v-for="(char, idx) in $t('tools.cron.usage.chars')" :key="idx">
              <code>{{ char.split(':')[0] }}</code>: {{ char.split(':')[1] }}
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-2">{{ $t('tools.cron.usage.caution_title') }}</h4>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li v-for="(caution, idx) in $t('tools.cron.usage.cautions')" :key="idx">
              {{ caution }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.cron.detail_title')">
      <el-text>
        {{ $t('tools.cron.detail_content') }}
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>
.custom-tabs :deep(.el-tabs__item) {
  border: none;
  background: transparent;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  border: 1px solid #409eff;
  background: #f0f9ff;
}

.custom-tabs :deep(.el-tabs__content) {
  overflow-y: visible;
}
</style>
