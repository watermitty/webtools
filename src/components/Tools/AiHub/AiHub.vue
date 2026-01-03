```vue
<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useI18n } from 'vue-i18n';
import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
import ToolDetail from "@/components/Layout/ToolDetail/ToolDetail.vue";

const { t } = useI18n();

const info = computed(() => ({
  title: t('tools.aihub.title'),
  desc: t('tools.aihub.desc'),
}));

type LinkItem = { title: string; url: string; desc?: string; logo?: string; rating?: number }
type Cate = { title: string; list: LinkItem[] }

const cates = computed(() => [
  { label: t('tools.aihub.cate_voice'), value: "voice" },
  { label: t('tools.aihub.cate_chat'), value: "chat" },
  { label: t('tools.aihub.cate_creation'), value: "creation" },
  { label: t('tools.aihub.cate_translate'), value: "translate" },
]);

// 链接列表
const items = computed(() => [
  // 1. 音色克隆 / TTS
  {
    icon: "https://www.voicv.com/favicon.ico",
    title: "Voicv",
    desc: t('tools.aihub.items.voicv_desc'),
    link: "https://www.voicv.com/",
    cate: "voice",
  },
  {
    icon: "https://elevenlabs.io/favicon.ico",
    title: "ElevenLabs",
    desc: t('tools.aihub.items.elevenlabs_desc'),
    link: "https://elevenlabs.io/",
    cate: "voice",
  },
  // 3. 对话 / 智能体
  {
    icon: "https://ai.google.dev/favicon.ico",
    title: "Google AI Studio",
    desc: t('tools.aihub.items.google_ai_desc'),
    link: "https://aistudio.google.com/",
    cate: "chat",
  },
  {
    icon: "https://chatgpt.com/favicon.ico",
    title: "ChatGPT",
    desc: t('tools.aihub.items.openai_desc'),
    link: "https://chatgpt.com/",
    cate: "chat",
  },
  {
    icon: "https://www.perplexity.ai/favicon.ico",
    title: "Perplexity",
    desc: t('tools.aihub.items.perplexity_desc'),
    link: "https://www.perplexity.ai/",
    cate: "chat",
  },
  {
    icon: "https://poe.com/favicon.ico",
    title: "Poe",
    desc: t('tools.aihub.items.poe_desc'),
    link: "https://poe.com/",
    cate: "chat",
  },
  {
    icon: "https://gemini.google.com/favicon.ico",
    title: "Gemini",
    desc: t('tools.aihub.items.gemini_desc'),
    link: "https://gemini.google.com/",
    cate: "chat",
  },
  // 4. AI 创作平台
  {
    icon: "https://static.media.io/images/favicon.ico",
    title: "Media.io",
    desc: t('tools.aihub.items.media_io_desc'),
    link: "https://www.media.io/",
    cate: "creation",
  },
  {
    icon: "https://v0.dev/favicon.ico",
    title: "v0",
    desc: t('tools.aihub.items.v0_desc'),
    link: "https://v0.dev/",
    cate: "creation",
  },
  {
    icon: "https://codebuddy.cn/favicon.ico",
    title: "CodeBuddy",
    desc: t('tools.aihub.items.codebuddy_desc'),
    link: "https://codebuddy.cn/",
    cate: "creation",
  },
  {
    icon: "https://www.trae.ai/favicon.png", // Trae icon might vary, preserving original if any
    title: "Trae",
    desc: t('tools.aihub.items.trae_desc'),
    link: "https://www.trae.ai/",
    cate: "creation",
  },
  // 5. 翻译 / 文档
  {
    icon: "https://www.deepl.com/favicon.ico",
    title: "DeepL",
    desc: t('tools.aihub.items.deepl_desc'),
    link: "https://www.deepl.com/",
    cate: "translate",
  },
]);
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title" />
    <div class="p-4 rounded-2xl bg-white">
      <div class="space-y-6">
        <ToolDetail v-for="cate in cates" :key="cate.value" :title="cate.label">
          <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <a
              v-for="item in items.filter(i => i.cate === cate.value)"
              :key="item.title"
              class="group border rounded-xl p-3 sm:p-4 hover:shadow-md transition bg-white flex flex-col items-start gap-3 overflow-hidden"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="w-full">
                <div class="flex items-center gap-2">
                  <div class="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                    <img v-if="item.icon" :src="item.icon" :alt="item.title" class="w-full h-full object-contain rounded-lg" />
                    <span v-else>{{ item.title[0] }}</span>
                  </div>
                  <div class="flex-1 min-w-0 font-medium text-gray-900 group-hover:text-blue-600 truncate">
                    {{ item.title }}
                  </div>
                  <!-- H5 数字评分；仅移动端展示 -->
                  <p class="mt-4 text-xs text-gray-500 sm:hidden flex-shrink-0">{{ t('tools.aihub.open_new') }}</p>
                  <span class="text-gray-400 group-hover:text-blue-500 flex-shrink-0">→</span>
                </div>
                <!-- 平板及以上：星星评分单独一行显示 -->
                <div class="mt-1 hidden sm:block">
                  <!-- Ratings are not present in the new `items` structure, so this part is removed or adapted -->
                  <!-- <el-rate
                    :model-value="item.rating ?? 0"
                    disabled
                    allow-half
                    :max="5"
                    size="small"
                  />
                </div>
                <div class="text-gray-500 text-sm whitespace-pre-line break-words mt-2" v-if="item.desc">
                  {{ item.desc }}
                </div>
              </div>
            </a>
          </div>
        </ToolDetail>
      </div>
    </div>

    <ToolDetail title="说明">
      <el-text>收录常用第三方AI工具，点击卡片将在新窗口打开；</el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
</style>