<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from 'vue-i18n';
import axios from "axios";
import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
import ToolDetail from "@/components/Layout/ToolDetail/ToolDetail.vue";

const { t, locale } = useI18n();

const info = computed(() => ({
  title: t('tools.aimotivation.title'),
  desc: t('tools.aimotivation.desc'),
}));

const pollinationsApiKey = ref(import.meta.env.VITE_POLLINATIONS_API_KEY || "");
const pollinationsProxyUrl = ref(import.meta.env.VITE_POLLINATIONS_PROXY_URL);
const pollinationsTextUrl = ref(import.meta.env.VITE_POLLINATIONS_TEXT_URL);
const pollinationsUrl = ref(import.meta.env.VITE_POLLINATIONS_URL);

// 状态管理
const loading = ref(false);
const refreshing = ref(false);
const autoRefresh = ref(true);
const refreshInterval = ref(1); // 默认1分钟
const selectedStyle = ref("motivational");
const generateCount = ref(5); // 新增：生成条数
const lastRefreshTime = ref<Date | null>(null);
const refreshTimer = ref<number | null>(null); // 修复：使用number类型
const retryCount = ref(0); // 新增：重试次数

// 鸡汤文数据
const motivationList = ref<
  Array<{
    id: number;
    content: string;
    style: string;
    timestamp: Date;
  }>
>([]);

// 风格选项
const styleOptions = computed(() => [
  { value: "motivational", label: t('tools.aimotivation.styles.motivational'), emoji: "⚡" },
  { value: "emotional", label: t('tools.aimotivation.styles.emotional'), emoji: "❤️" },
  { value: "growth", label: t('tools.aimotivation.styles.growth'), emoji: "⭐" },
  { value: "career", label: t('tools.aimotivation.styles.career'), emoji: "💼" },
  { value: "learning", label: t('tools.aimotivation.styles.learning'), emoji: "🎓" },
  { value: "life", label: t('tools.aimotivation.styles.life'), emoji: "🏠" },
  { value: "friendship", label: t('tools.aimotivation.styles.friendship'), emoji: "👫" },
  { value: "love", label: t('tools.aimotivation.styles.love'), emoji: "💝" },
]);

// 生成条数选项
const countOptions = computed(() => [
  { value: 1, label: t('tools.aimotivation.counts.1') },
  { value: 2, label: t('tools.aimotivation.counts.2') },
  { value: 4, label: t('tools.aimotivation.counts.4') },
  { value: 5, label: t('tools.aimotivation.counts.5') },
  { value: 6, label: t('tools.aimotivation.counts.6') },
  { value: 8, label: t('tools.aimotivation.counts.8') },
  { value: 10, label: t('tools.aimotivation.counts.10') },
]);

// 刷新间隔选项
const intervalOptions = computed(() => [
  { value: 1, label: t('tools.aimotivation.intervals.1') },
  { value: 5, label: t('tools.aimotivation.intervals.5') },
  { value: 10, label: t('tools.aimotivation.intervals.10') },
]);

// 生成鸡汤文
const generateMotivations = async (isAutoRefresh: boolean = false) => {
  if (loading.value) return;

  loading.value = true;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // 获取当前选择风格的显示标签（用于提示词）
      const currentStyleLabel = styleOptions.value.find(s => s.value === selectedStyle.value)?.label || selectedStyle.value;
      
      const prompt = t('tools.aimotivation.prompt_template', {
        count: generateCount.value,
        style: currentStyleLabel
      });

      const resp = await axios.get(
        `${pollinationsProxyUrl.value}?path=${encodeURIComponent(
          prompt
        )}&target=${pollinationsTextUrl.value}&params=_t=${Date.now()}`,
        { headers: { Authorization: "Bearer " + pollinationsApiKey.value } }
      );

      let text = typeof resp.data === "string" ? resp.data : String(resp.data);

      // 处理返回的文本，分割成多条鸡汤文
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.length <= 100)
        .slice(0, generateCount.value);

      // 验证生成的内容是否有效
      if (lines.length === 0 || lines.some((line) => line.length < 10)) {
        throw new Error(t('tools.aimotivation.generate_fail'));
      }

      // 生成新的鸡汤文列表
      const newMotivations = lines.map((content, index) => ({
        id: Date.now() + index,
        content,
        style: selectedStyle.value,
        timestamp: new Date(),
      }));

      // 只有在成功生成后才替换原有内容
      motivationList.value = newMotivations;
      lastRefreshTime.value = new Date();

      // 如果开启了自动刷新，设置定时器
      if (autoRefresh.value) {
        setupAutoRefresh();
      }

      // 成功生成，跳出重试循环
      break;
    } catch (error) {
      retryCount++;
      console.error(`第${retryCount}次生成鸡汤文失败:`, error);

      // 如果还有重试机会，等待2秒后重试
      if (retryCount < maxRetries) {
        // 显示重试状态，但不清空现有内容
        console.log(`生成失败，2秒后进行第${retryCount + 1}次重试...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待2秒
        continue;
      }

      // 所有重试都失败了，保持原有内容不变
      console.log("所有重试都失败，保持原有内容");
      
      // 只有在手动刷新时才显示弹窗提示，自动刷新时不显示
      if (!isAutoRefresh) {
        alert(t('tools.aimotivation.generate_fail'));
      }
    }
  }

  loading.value = false;
};

// 手动刷新
const refreshMotivations = async () => {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    await generateMotivations(false); // 手动刷新，传入false
  } finally {
    refreshing.value = false;
  }
};

// 设置自动刷新
const setupAutoRefresh = () => {
  // 先清除之前的定时器
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
  
  // 只有在开启自动刷新时才设置新的定时器
  if (autoRefresh.value) {
    refreshTimer.value = setInterval(() => {
      generateMotivations(true); // 自动刷新，传入true
    }, refreshInterval.value * 60 * 1000);
  }
};

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    setupAutoRefresh();
  } else {
    // 关闭自动刷新时，清除定时器
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
      refreshTimer.value = null;
    }
  }
};

// 复制鸡汤文
const copyMotivation = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    // 可以添加一个临时的成功提示
    const element = document.createElement("div");
    element.textContent = t('tools.aimotivation.copy') + " " + t('tools.aimotivation.status_ready'); // Simple "Copied" replacement or just reuse copy label? I used "Copy" as label.
    // I should add "Copied Success" key or just use "已复制" translated?
    // I missed "Copied" key. I'll use "Action" + "Success"?
    // Or just "Copied". I have "copy" key.
    // I'll use `t('tools.aimotivation.copy') + " Success"` (generic).
    // Or just `element.textContent = "Copied!"` (Hardcoded English fallback? No.)
    // I'll add a key dynamically? No.
    // I'll use `t('tools.aimotivation.copy') + " √"`.
    element.textContent = t('tools.aimotivation.copy') + " √";
    element.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(element);
    setTimeout(() => {
      document.body.removeChild(element);
    }, 2000);
  } catch (error) {
    console.error("复制失败:", error);
  }
};

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 新增：封面生成相关状态
// 修改：每条鸡汤文独立的封面生成状态
const generatingCovers = ref<{ [key: number]: boolean }>({});
const showCoverModal = ref(false);
const generatedCoverUrl = ref("");
const currentMotivation = ref("");
const currentMotivationId = ref<number | null>(null);
const abortController = ref<AbortController | null>(null);

// 生成封面
const generateCover = async (motivation: string, motivationId: number) => {
  if (generatingCovers.value[motivationId]) return;
  
  // 设置当前鸡汤文的生成状态
  generatingCovers.value[motivationId] = true;
  currentMotivation.value = motivation;
  currentMotivationId.value = motivationId;
  
  // 先显示弹窗
  showCoverModal.value = true;
  
  // 创建AbortController用于取消请求
  abortController.value = new AbortController();
  
  try {
    // 构造封面生成的提示词
    const coverPrompt = `Motivational quote cover background: ${motivation}, minimalist modern design style, gradient background, high definition`;
    
    // 参考文生图页面的接口调用方式
    // 构造查询参数
    const params = {
      model: "sdxl", // 使用SDXL模型
      width: "1024",
      height: "1024",
      nologo: "true",
      seed: Math.floor(Math.random() * 100000000).toString(),
    };

    // 移除未定义的参数并确保所有值都是字符串
    const filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]) // 确保所有值都是字符串
    );

    // 添加时间戳避免缓存
    filteredParams._t = String(Date.now());

    // 将 filteredParams 转成 GET 参数拼接
    const queryString = new URLSearchParams(filteredParams).toString();
    const response = await axios.get(
      `${pollinationsProxyUrl.value}?path=prompt/${encodeURIComponent(coverPrompt)}&target=${pollinationsUrl.value}&params=${queryString}`,
      {
        headers: {
          Authorization: "Bearer " + pollinationsApiKey.value,
        },
        responseType: "blob",
        signal: abortController.value.signal, // 添加取消信号
      }
    );

    const blob = new Blob([response.data], { type: "image/png" });
    const imageUrl = URL.createObjectURL(blob);
    
    // 将文字叠加到图片上
    const finalImageUrl = await addTextToImage(imageUrl, motivation);
    generatedCoverUrl.value = finalImageUrl;
    
    // 生成完成，弹窗内容从loading变为图片展示
    
  } catch (error) {
    // 如果是取消请求导致的错误，不显示错误提示，但需要重置状态
    if (axios.isCancel(error)) {
      console.log('请求已取消');
      // 请求被取消时，状态已经在closeCoverModal中重置，这里不需要额外处理
      return;
    }
    
    console.error("生成封面失败:", error);
    alert(t('tools.aimotivation.generate_fail'));
    
    // 生成失败时也需要重置状态
    if (currentMotivationId.value !== null) {
      generatingCovers.value[currentMotivationId.value] = false;
    }
  } finally {
    // 清理AbortController
    abortController.value = null;
    // 注意：这里不再重置generatingCovers状态，因为成功时不需要重置，失败时在上面已经重置
  }
};

// 将文字叠加到图片上
const addTextToImage = (imageUrl: string, text: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // 设置canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制背景图片
      ctx.drawImage(img, 0, 0);
      
      // 添加半透明遮罩，让文字更清晰
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 设置文字样式
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 根据文字长度调整字体大小
      const maxWidth = canvas.width * 0.8;
      let fontSize = Math.min(80, canvas.width / 15);
      
      // 分行处理长文本
      const words = text.split('');
      const lines: string[] = [];
      let currentLine = '';
      
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        ctx.font = `${fontSize}px "Microsoft YaHei", sans-serif`;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // 如果行数太多，减小字体
      if (lines.length > 4) {
        fontSize = Math.min(60, canvas.width / 20);
        ctx.font = `${fontSize}px "Microsoft YaHei", sans-serif`;
      }
      
      // 绘制文字
      const lineHeight = fontSize * 1.5;
      const totalHeight = lineHeight * lines.length;
      const startY = (canvas.height - totalHeight) / 2;
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        
        // 添加文字阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(line, canvas.width / 2, y);
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });
      
      // 转换为base64
      const finalImageUrl = canvas.toDataURL('image/png');
      resolve(finalImageUrl);
    };
    
    img.src = imageUrl;
  });
};

// 关闭封面弹窗
const closeCoverModal = () => {
  // 如果正在生成中，取消请求
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
  }
  
  // 重置当前鸡汤文的生成状态
  if (currentMotivationId.value !== null) {
    generatingCovers.value[currentMotivationId.value] = false;
  }
  
  showCoverModal.value = false;
  generatedCoverUrl.value = "";
  currentMotivation.value = "";
  currentMotivationId.value = null;
};

// 下载封面
const downloadCover = () => {
  if (!generatedCoverUrl.value) return;
  
  const link = document.createElement('a');
  link.download = `motivation_cover_${Date.now()}.png`;
  link.href = generatedCoverUrl.value;
  link.click();
};


// 组件挂载时自动生成一次
onMounted(() => {
  generateMotivations();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});

// 监听设置变化
const handleIntervalChange = () => {
  if (autoRefresh.value) {
    setupAutoRefresh();
  }
};

const handleStyleChange = () => {
  generateMotivations();
};

const handleCountChange = () => {
  generateMotivations();
};
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title" />

    <div class="p-6 rounded-2xl bg-white">
      <!-- 控制面板 -->
      <div
        class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- 风格选择 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ t('tools.aimotivation.style_label') }}</label>
            <select
              v-model="selectedStyle"
              @change="handleStyleChange"
              class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option
                v-for="style in styleOptions"
                :key="style.value"
                :value="style.value"
              >
                {{ style.emoji }} {{ style.label }}
              </option>
            </select>
          </div>

          <!-- 生成条数选择 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ t('tools.aimotivation.count_label') }}</label>
            <select
              v-model="generateCount"
              @change="handleCountChange"
              class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option
                v-for="count in countOptions"
                :key="count.value"
                :value="count.value"
              >
                {{ count.label }}
              </option>
            </select>
          </div>

          <!-- 刷新间隔 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"
              >{{ t('tools.aimotivation.interval_label') }}</label
            >
            <select
              v-model="refreshInterval"
              @change="handleIntervalChange"
              :disabled="!autoRefresh"
              class="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option
                v-for="interval in intervalOptions"
                :key="interval.value"
                :value="interval.value"
              >
                {{ interval.label }}
              </option>
            </select>
          </div>

          <!-- 自动刷新开关 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ t('tools.aimotivation.auto_refresh_label') }}</label>
            <div class="flex items-center">
              <button
                @click="toggleAutoRefresh"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  autoRefresh ? 'bg-blue-600' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    autoRefresh ? 'translate-x-6' : 'translate-x-1',
                  ]"
                />
              </button>
              <span class="ml-2 text-sm text-gray-600">
                {{ autoRefresh ? t('tools.aimotivation.auto_refresh_on') : t('tools.aimotivation.auto_refresh_off') }}
              </span>
            </div>
          </div>

          <!-- 手动刷新按钮 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ t('tools.aimotivation.action_label') }}</label>
            <button
              @click="refreshMotivations"
              :disabled="refreshing || loading"
              class="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="refreshing" class="flex items-center justify-center">
                <div class="refresh-spinner mr-2"></div>
                {{ t('tools.aimotivation.refreshing') }}
              </span>
              <span v-else>{{ t('tools.aimotivation.refresh_btn') }}</span>
            </button>
          </div>
        </div>

        <!-- 状态信息 -->
        <div
          class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0"
        >
          <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span
              >{{ t('tools.aimotivation.status_label') }}
              {{
                loading ? t('tools.aimotivation.status_generating') : refreshing ? t('tools.aimotivation.status_refreshing') : t('tools.aimotivation.status_ready')
              }}</span
            >
            <span v-if="lastRefreshTime">
              {{ t('tools.aimotivation.last_refresh') }} {{ formatDate(lastRefreshTime) }}
              {{ formatTime(lastRefreshTime) }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span>{{ t('tools.aimotivation.current_style') }} {{ styleOptions.find(s => s.value === selectedStyle)?.label }}</span>
            <span>{{ t('tools.aimotivation.current_interval') }} {{ refreshInterval }} {{ t('tools.aimotivation.intervals.1').split(' ')[1] }}</span>
          </div>
        </div>
      </div>

      <!-- 鸡汤文展示区域 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ t('tools.aimotivation.list_title', { style: styleOptions.find(s => s.value === selectedStyle)?.label, count: motivationList.length }) }}
          </h3>
          <div class="text-sm text-gray-500">
            {{
              autoRefresh ? t('tools.aimotivation.mode_auto', { refreshInterval }) : t('tools.aimotivation.mode_manual')
            }}
          </div>
        </div>

        <!-- 加载状态 - 只在首次加载且没有内容时显示 -->
        <div v-if="loading && motivationList.length === 0" class="text-center py-12">
          <div class="inline-flex items-center space-x-2">
            <div class="loading-spinner-large"></div>
            <span class="text-lg text-gray-600">
              {{
                retryCount > 0
                  ? t('tools.aimotivation.generate_fail')
                  : t('tools.aimotivation.status_generating')
              }}
            </span>
          </div>
          <div v-if="retryCount > 0" class="mt-2 text-sm text-orange-600">
            {{ t('tools.aimotivation.retry_count', { count: retryCount }) }}
          </div>
        </div>

        <!-- 刷新状态提示 - 在已有内容时显示 -->
        <div v-if="refreshing && motivationList.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center justify-center space-x-2 text-blue-700">
            <div class="loading-spinner-small"></div>
            <span>{{ t('tools.aimotivation.refreshing_msg') }}</span>
          </div>
        </div>

        <!-- 鸡汤文列表 - 始终显示，除非首次加载且没有内容 -->
        <div v-if="!loading || motivationList.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="motivation in motivationList"
            :key="motivation.id"
            class="group relative p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <!-- 风格标签 -->
            <div class="absolute top-3 right-3">
              <span
                class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full"
              >
                {{ styleOptions.find(s => s.value === motivation.style)?.label || motivation.style }}
              </span>
            </div>

            <!-- 鸡汤文内容 -->
            <div class="mb-4 pt-8">
              <p class="text-lg text-gray-800 leading-relaxed font-medium">
                "{{ motivation.content }}"
              </p>
            </div>

            <!-- 底部信息 -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <button
                @click="generateCover(motivation.content, motivation.id)"
                :disabled="generatingCovers[motivation.id]"
                class="px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="generatingCovers[motivation.id]" class="flex items-center">
                  <div class="refresh-spinner mr-1"></div>
                  {{ t('tools.aimotivation.generating_cover') }}
                </span>
                <span v-else>{{ t('tools.aimotivation.generate_cover') }}</span>
              </button>
              <button
                @click="copyMotivation(motivation.content)"
                class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                {{ t('tools.aimotivation.copy') }}
              </button>
            </div>

            <!-- 装饰元素 -->
            <div
              class="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full opacity-20"
            ></div>
            <div
              class="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-300 rounded-full opacity-20"
            ></div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="!loading && motivationList.length === 0"
          class="text-center py-12"
        >
          <div class="text-gray-400">
            <div class="text-6xl mb-4">☕</div>
            <div class="text-lg">{{ t('tools.aimotivation.empty_title') }}</div>
            <div class="text-sm">{{ t('tools.aimotivation.empty_msg') }}</div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-800 mb-2">{{ t('tools.aimotivation.usage_title') }}</h4>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>{{ t('tools.aimotivation.usage_1') }}</li>
          <li>{{ t('tools.aimotivation.usage_2') }}</li>
          <li>{{ t('tools.aimotivation.usage_3') }}</li>
          <li>
            {{ t('tools.aimotivation.usage_4') }}
          </li>
        </ul>
      </div>
    </div>

    <ToolDetail title="描述">
      <el-text>{{ info.desc }}</el-text>
    </ToolDetail>
  </div>

  <!-- 修改：封面生成弹窗 -->
  <div
    v-if="showCoverModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeCoverModal"
  >
    <div class="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-xl font-semibold text-gray-800">
          {{ generatedCoverUrl ? t('tools.aimotivation.cover_modal_title') : t('tools.aimotivation.cover_modal_loading') }}
        </h3>
        <button
          @click="closeCoverModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-6 max-h-[70vh] overflow-y-auto">
        <!-- 生成中状态 -->
        <div v-if="!generatedCoverUrl" class="text-center py-12">
          <div class="inline-flex items-center space-x-2">
            <div class="loading-spinner-large"></div>
            <span class="text-lg text-gray-600">{{ t('tools.aimotivation.cover_modal_loading') }}</span>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            <p>鸡汤文内容：</p>
            <p class="mt-2 text-lg font-medium text-gray-800">"{{ currentMotivation }}"</p>
          </div>
        </div>
        
        <!-- 生成完成状态 -->
        <div v-else class="text-center">
          <div class="mb-4">
            <p class="text-gray-600 mb-2">鸡汤文内容：</p>
            <p class="text-lg font-medium text-gray-800">"{{ currentMotivation }}"</p>
          </div>
          
          <div class="flex justify-center mb-6">
            <img
              :src="generatedCoverUrl"
              :alt="t('tools.aimotivation.cover_modal_title')"
              class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
            />
          </div>
          
          <div class="flex justify-center space-x-4">
            <button
              @click="downloadCover"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ t('tools.aimotivation.download_cover') }}
            </button>
            <button
              @click="closeCoverModal"
              class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {{ t('tools.aimotivation.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义loading动画 */
.loading-spinner-large {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 新增：刷新按钮专用的loading动画 */
.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-pulse {
  position: absolute;
  inset: 0;
  width: 24px;
  height: 24px;
  border: 4px solid transparent;
  border-top: 4px solid #60a5fa;
  border-radius: 50%;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.progress-bar {
  height: 8px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 9999px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes progress {
  0%,
  100% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
}

/* 确保动画在Safari等浏览器中正常工作 */
.loading-spinner-large,
.loading-spinner-small,
.refresh-spinner {
  -webkit-animation: spin 1s linear infinite;
  -moz-animation: spin 1s linear infinite;
  -o-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
}

/* 添加一些额外的loading效果 */
.loading-spinner-large::after {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 3px solid transparent;
  border-top: 3px solid #dbeafe;
  border-radius: 50%;
  animation: spin 1.5s linear infinite reverse;
}
</style>
