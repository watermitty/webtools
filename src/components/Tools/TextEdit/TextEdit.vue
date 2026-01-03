<script setup lang="ts">
import { reactive, ref, shallowRef, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '@wangeditor/editor/dist/css/style.css' // 引入富文本 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'  //富文本组件
import { copy } from '@/utils/string'
const { t } = useI18n()
const info = reactive({
  title: "tools.textedit.title",
  mode: 'default',
})
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容
const content = ref(``)
// html
const html = ref('')

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    "uploadImage",
    "group-video",
    "insertLink",
  ]
}

//编辑器配置
const editorConfig = { placeholder: t('tools.textedit.placeholder') }

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
  // html = editor.getHtml()
}

const handleChange = (editor) => {
  html.value = editor.getHtml()
}


// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

onMounted(() => {

})

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white h-[510px]">
      <div class="border z-10 mt-3 h-96">
        <Toolbar
          class=""
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="info.mode"
        />
        <Editor
          class="border"
          v-model="content"
          :defaultConfig="editorConfig"
          :mode="info.mode"
          @onCreated="handleCreated"
          @onChange="handleChange"
        />
      </div>
      
    </div>

    <div class="p-4 mt-3 rounded-2xl bg-white">
      <el-button type="primary" @click="copyRes(html)">{{ $t('tools.textedit.copy_html') }}</el-button>
      <el-input
        v-model="html"
        disabled
        class="mt-3"
        type="textarea"
        autosize
        :placeholder="$t('tools.textedit.preview_placeholder')"
      />
    </div>

    <!-- desc -->
    <!-- desc -->
    <ToolDetail :title="$t('tools.textedit.desc_title')">
      <el-text>
        {{ $t('tools.textedit.desc_content') }}
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
.downext-select{
  @apply w-24
}
</style>