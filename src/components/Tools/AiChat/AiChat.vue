<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
import ToolDetail from "@/components/Layout/ToolDetail/ToolDetail.vue";
import AiChatCore from "@/components/Common/AiChatCore.vue";

const { t } = useI18n();
const route = useRoute();

const info = computed(() => ({
  title: t('tools.aichat.title'),
}));

const chatCoreRef = ref();
const urlParamsProcessed = ref(false);

// ... (rest of script)

// ...

// ...
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <!-- 使用公共聊天组件 -->
    <AiChatCore
      ref="chatCoreRef"
      :title="info.title"
      storage-key="ai-chat-provider-selection"
      @conversation-started="handleConversationStarted"
    />

    <!-- 功能说明 -->
    <ToolDetail :title="t('tools.aichat.detail.title')" class="mt-4">
      <el-text>
        {{ t('tools.aichat.detail.content_intro') }}
        <br>• {{ t('tools.aichat.detail.list_provider') }}
        <br>• {{ t('tools.aichat.detail.list_model') }}
        <br>• {{ t('tools.aichat.detail.list_memory') }}
        <br>• {{ t('tools.aichat.detail.list_stream') }}
        <br>• {{ t('tools.aichat.detail.list_retry') }}
        <br>• {{ t('tools.aichat.detail.list_prompt') }}
        <br>• {{ t('tools.aichat.detail.list_responsive') }}
        <br><br>
        <strong>{{ t('tools.aichat.detail.usage_title') }}</strong>
        <br>{{ t('tools.aichat.detail.usage_1') }}
        <br>{{ t('tools.aichat.detail.usage_2') }}
        <br>{{ t('tools.aichat.detail.usage_3') }}
        <br>{{ t('tools.aichat.detail.usage_4') }}
        <br>{{ t('tools.aichat.detail.usage_5') }}
        <br>{{ t('tools.aichat.detail.usage_6') }}
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 自定义旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.6;
}

/* 流式输出动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.streaming-cursor::after {
  content: '▋';
  animation: pulse 1s infinite;
  color: #3b82f6;
}

/* 思考过程样式 */
.reasoning-content {
  line-height: 1.5;
  font-size: 0.875rem;
}

.reasoning-content :deep(p) {
  margin: 0.3em 0;
}

.reasoning-content :deep(code) {
  background-color: #e0f2fe;
  color: #0277bd;
  padding: 0.1em 0.3em;
  border-radius: 0.2em;
  font-size: 0.8em;
}
</style>
