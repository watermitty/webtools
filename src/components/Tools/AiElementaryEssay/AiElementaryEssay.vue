<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useI18n } from 'vue-i18n';
import axios from "axios";
import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
import ToolDetail from "@/components/Layout/ToolDetail/ToolDetail.vue";

const { t } = useI18n();

const info = computed(() => ({
  title: t('tools.aiessay.title'),
  desc: t('tools.aiessay.desc'),
}));

const pollinationsApiKey = ref(import.meta.env.VITE_POLLINATIONS_API_KEY || "");
const pollinationsProxyUrl = ref(import.meta.env.VITE_POLLINATIONS_PROXY_URL);
const pollinationsTextUrl = ref(import.meta.env.VITE_POLLINATIONS_TEXT_URL);

const title = ref("");
const grade = ref<
  "一年级" | "二年级" | "三年级" | "四年级" | "五年级" | "六年级"
>("三年级");
const genre = ref<"写人" | "叙事" | "写景" | "状物" | "应用文">("叙事");
const tone = ref<"童趣活泼" | "真诚朴实" | "优美细腻" | "幽默轻松">("童趣活泼");
const words = ref<200 | 300 | 400 | 500>(300);
const keywords = ref("");
const customReq = ref("");
const useMetaphor = ref(true);
const usePersonification = ref(true);
const useParallel = ref(false);
const useDialogue = ref(true);
const threePart = ref(true);
const echoBeginningEnd = ref(true);
const simpleWords = ref(true);

const loading = ref(false);
const result = ref("");

const buildPrompt = () => {
  const kws = keywords.value.trim();
  const req: string[] = [];
  if (threePart.value) req.push("三段式结构");
  if (echoBeginningEnd.value) req.push("首尾呼应");
  if (useDialogue.value) req.push("包含对话");
  if (useMetaphor.value) req.push("比喻");
  if (usePersonification.value) req.push("拟人");
  if (useParallel.value) req.push("排比");
  if (simpleWords.value) req.push("用词浅显");

  const reqText = req.length ? `，要求：${req.join("、")}` : "";
  const t = title.value.trim()
    ? `，题目：《${title.value.trim()}》`
    : "，题目自拟（2-10字）";
  const kline = kws ? `，关键词：${kws}` : "";
  const extra = customReq.value.trim()
    ? `，其他要求：${customReq.value
        .trim()
        .replace(/[\r\n]+/g, " ")
        .replace(/[，。；]+/g, "，")}`
    : "";

  const s = `${grade.value}作文，约${words.value}字，${genre.value}，${tone.value}${kline}${t}${reqText}${extra}。请直接输出“标题：xxx”和“正文：...”的内容，不要附加解释。`;
  return s;
};

const generate = async () => {
  loading.value = true;
  result.value = "";
  try {
    const prompt = buildPrompt();
    const resp = await axios.get(
      `${pollinationsProxyUrl.value}?path=${encodeURIComponent(
        prompt
      )}&target=${pollinationsTextUrl.value}&params=_t=${Date.now()}`,
      { headers: { Authorization: "Bearer " + pollinationsApiKey.value } }
    );
    const text: string =
      typeof resp.data === "string" ? resp.data : String(resp.data);
    result.value = text;
  } catch (e) {
    console.error(e);
    alert(t('tools.aimotivation.generate_fail')); // Reuse generic fail msg or new one? I have generic one.
  } finally {
    loading.value = false;
  }
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(t('tools.aimotivation.copy') + " " + t('tools.aimotivation.status_ready')); // Reuse copy success msg strategy
  } catch {
    alert("Copy failed");
  }
};

const resetForm = () => {
  title.value = "";
  grade.value = "三年级";
  genre.value = "叙事";
  tone.value = "童趣活泼";
  words.value = 300;
  keywords.value = "";
  customReq.value = ''
  useMetaphor.value = true;
  usePersonification.value = true;
  useParallel.value = false;
  useDialogue.value = true;
  threePart.value = true;
  echoBeginningEnd.value = true;
  simpleWords.value = true;
  result.value = "";
};
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title" />
    <div class="p-4 rounded-2xl bg-white">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-3">
          <input
            v-model="title"
            :placeholder="t('tools.aiessay.placeholder_title')"
            class="w-full p-2 border rounded"
          />
          <div class="grid grid-cols-2 gap-2">
            <select v-model="grade" class="w-full p-2 border rounded">
              <option :value="'一年级'">{{ t('tools.aiessay.grade_1') }}</option>
              <option :value="'二年级'">{{ t('tools.aiessay.grade_2') }}</option>
              <option :value="'三年级'">{{ t('tools.aiessay.grade_3') }}</option>
              <option :value="'四年级'">{{ t('tools.aiessay.grade_4') }}</option>
              <option :value="'五年级'">{{ t('tools.aiessay.grade_5') }}</option>
              <option :value="'六年级'">{{ t('tools.aiessay.grade_6') }}</option>
            </select>
            <select v-model="genre" class="w-full p-2 border rounded">
              <option :value="'写人'">{{ t('tools.aiessay.genre_person') }}</option>
              <option :value="'叙事'">{{ t('tools.aiessay.genre_narrative') }}</option>
              <option :value="'写景'">{{ t('tools.aiessay.genre_scenery') }}</option>
              <option :value="'状物'">{{ t('tools.aiessay.genre_object') }}</option>
              <option :value="'应用文'">{{ t('tools.aiessay.genre_practical') }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="tone" class="w-full p-2 border rounded">
              <option :value="'童趣活泼'">{{ t('tools.aiessay.tone_lively') }}</option>
              <option :value="'真诚朴实'">{{ t('tools.aiessay.tone_sincere') }}</option>
              <option :value="'优美细腻'">{{ t('tools.aiessay.tone_beautiful') }}</option>
              <option :value="'幽默轻松'">{{ t('tools.aiessay.tone_humorous') }}</option>
            </select>
            <select v-model="words" class="w-full p-2 border rounded">
              <option :value="200">{{ t('tools.aiessay.words_approx', {n: 200}) }}</option>
              <option :value="300">{{ t('tools.aiessay.words_approx', {n: 300}) }}</option>
              <option :value="400">{{ t('tools.aiessay.words_approx', {n: 400}) }}</option>
              <option :value="500">{{ t('tools.aiessay.words_approx', {n: 500}) }}</option>
            </select>
          </div>
          <textarea
            v-model="keywords"
            :placeholder="t('tools.aiessay.placeholder_keywords')"
            class="w-full p-2 border rounded min-h-[80px]"
          ></textarea>
          <textarea
            v-model="customReq"
            :placeholder="t('tools.aiessay.placeholder_custom')"
            class="w-full p-2 border rounded min-h-[60px]"
          ></textarea>

          <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="threePart" />{{ t('tools.aiessay.checkbox_three_part') }}</label
            >
            <label class="flex items-center gap-2"
              ><input
                type="checkbox"
                v-model="echoBeginningEnd"
              />{{ t('tools.aiessay.checkbox_echo') }}</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="useDialogue" />{{ t('tools.aiessay.checkbox_dialogue') }}</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="useMetaphor" />{{ t('tools.aiessay.checkbox_metaphor') }}</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="usePersonification" />{{ t('tools.aiessay.checkbox_personification') }}</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="useParallel" />{{ t('tools.aiessay.checkbox_parallel') }}</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="simpleWords" />{{ t('tools.aiessay.checkbox_simple') }}</label
            >
          </div>

          <div class="flex gap-2">
            <button
              @click="generate"
              :disabled="loading"
              class="px-4 py-2 rounded text-white"
              :class="loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'"
            >
              {{ loading ? t('tools.aiessay.btn_generating') : t('tools.aiessay.btn_generate') }}
            </button>
            <button
              @click="resetForm"
              class="px-4 py-2 rounded border hover:bg-gray-50"
            >
              {{ t('tools.aiessay.btn_reset') }}
            </button>
            <button
              @click="copyText(result)"
              class="px-4 py-2 rounded border hover:bg-gray-50"
            >
              {{ t('tools.aiessay.btn_copy') }}
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <textarea
            v-model="result"
            readonly
            class="w-full p-3 border rounded min-h-[320px] bg-gray-50"
            :placeholder="t('tools.aiessay.result_placeholder')"
          ></textarea>
        </div>
      </div>
    </div>

    <ToolDetail title="描述">
      <el-text>{{ info.desc }}</el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
</style>
