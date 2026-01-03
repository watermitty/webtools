<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t } = useI18n()

const state = reactive({
  input: '',
  byLine: false,
})

const out = reactive({
  camel: '',
  pascal: '',
  snake: '',
  kebab: '',
})

function splitWords(s: string): string[] {
  if (!s) return []
  let t = s.replace(/[_-]+/g, ' ')
  t = t.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  t = t.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  const words = (t.match(/[A-Za-z0-9]+/g) || []).map(w => w.toLowerCase())
  return words
}

const cap = (w: string) => (w ? w[0].toUpperCase() + w.slice(1) : w)
const toCamel = (ws: string[]) => (ws.length ? ws[0] + ws.slice(1).map(cap).join('') : '')
const toPascal = (ws: string[]) => ws.map(cap).join('')
const toSnake = (ws: string[]) => ws.join('_')
const toKebab = (ws: string[]) => ws.join('-')

function convertOne(line: string) {
  const ws = splitWords(line)
  return {
    camel: toCamel(ws),
    pascal: toPascal(ws),
    snake: toSnake(ws),
    kebab: toKebab(ws),
  }
}

function convertAll() {
  if (!state.byLine) {
    const r = convertOne(state.input.trim())
    out.camel = r.camel
    out.pascal = r.pascal
    out.snake = r.snake
    out.kebab = r.kebab
    return
  }
  const lines = state.input.replace(/\r\n/g, '\n').split('\n')
  const camelLines: string[] = []
  const pascalLines: string[] = []
  const snakeLines: string[] = []
  const kebabLines: string[] = []
  for (const ln of lines) {
    if (ln.trim() === '') {
      camelLines.push('')
      pascalLines.push('')
      snakeLines.push('')
      kebabLines.push('')
      continue
    }
    const r = convertOne(ln)
    camelLines.push(r.camel)
    pascalLines.push(r.pascal)
    snakeLines.push(r.snake)
    kebabLines.push(r.kebab)
  }
  out.camel = camelLines.join('\n')
  out.pascal = pascalLines.join('\n')
  out.snake = snakeLines.join('\n')
  out.kebab = kebabLines.join('\n')
}

const clearAll = () => {
  state.input = ''
  out.camel = out.pascal = out.snake = out.kebab = ''
}

const copyCamel = () => copy(out.camel)
const copyPascal = () => copy(out.pascal)
const copySnake = () => copy(out.snake)
const copyKebab = () => copy(out.kebab)

const fillExample = () => {
  state.input = 'helloWorld\nuser_name\nHTTPServer\norder-item'
  state.byLine = true
}

watch(() => [state.input, state.byLine], convertAll, { deep: true })
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t('tools.namingcase.title')" />
    <div class="p-4 rounded-2xl bg-white">
      <div class="mb-2 text-sm text-gray-500">
        {{ $t('tools.namingcase.hint') }}
        <el-link class="ml-2" type="primary" @click="fillExample">{{ $t('tools.namingcase.fill_example') }}</el-link>
      </div>
      <div class="flex items-center gap-3 mb-3">
        <el-switch v-model="state.byLine" :active-text="$t('tools.namingcase.by_line')" :inactive-text="$t('tools.namingcase.whole')" />
        <el-button type="danger" @click="clearAll">{{ $t('tools.namingcase.clear') }}</el-button>
      </div>
      <el-input
        type="textarea"
        :rows="6"
        v-model="state.input"
        :placeholder="$t('tools.namingcase.placeholder')"
      />
      <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-gray-600">camelCase</div>
            <el-button size="small" @click="copyCamel">{{ $t('tools.namingcase.copy') }}</el-button>
          </div>
          <el-input type="textarea" :rows="5" v-model="out.camel" readonly />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-gray-600">PascalCase</div>
            <el-button size="small" @click="copyPascal">{{ $t('tools.namingcase.copy') }}</el-button>
          </div>
          <el-input type="textarea" :rows="5" v-model="out.pascal" readonly />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-gray-600">snake_case</div>
            <el-button size="small" @click="copySnake">{{ $t('tools.namingcase.copy') }}</el-button>
          </div>
          <el-input type="textarea" :rows="5" v-model="out.snake" readonly />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-gray-600">kebab-case</div>
            <el-button size="small" @click="copyKebab">{{ $t('tools.namingcase.copy') }}</el-button>
          </div>
          <el-input type="textarea" :rows="5" v-model="out.kebab" readonly />
        </div>
      </div>
    </div>

    <ToolDetail :title="$t('tools.namingcase.detail_title')">
      <el-text>
        {{ $t('tools.namingcase.detail_content') }}
      </el-text>
    </ToolDetail>
  </div>
</template>
