```vue
<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import AiProviderSelector from "./AiProviderSelector.vue";
import { aiManager } from "@/spi";

const { t } = useI18n();

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  reasoning?: string;
  timestamp: number;
  failed?: boolean;
  streaming?: boolean;
}

interface ProviderSelection {
  provider: string;
  model: string;
}

const props = defineProps<{
  title: string;
  storageKey?: string;
  initialMessages?: Message[];
  systemPrompt?: string;
  autoSendPrompt?: boolean;
}>();

const emit = defineEmits<{
  messageAdded: [message: Message];
  conversationStarted: [];
  providerChanged: [selection: ProviderSelection];
}>();

// 在messages定义后添加系统提示词的响应式变量
const messages = ref<Message[]>(props.initialMessages || []);
const systemPrompt = ref(props.systemPrompt || '');
const loading = ref(false);
const chatContainer = ref<HTMLElement>();
const selectedProvider = ref<ProviderSelection>({ provider: '', model: '' });
const isSubmitting = ref(false);
const isStreaming = ref(false);
const currentStreamingMessageId = ref<string | null>(null);
const abortController = ref<AbortController | null>(null);

// 生成唯一ID
let messageIdCounter = 0;
const generateMessageId = () => {
  return `msg_${Date.now()}_${++messageIdCounter}`;
};

// 添加消息
const addMessage = (type: "user" | "assistant", content: string, streaming = false) => {
  const messageId = generateMessageId();
  const message: Message = {
    id: messageId,
    type,
    content,
    timestamp: Date.now(),
    streaming
  };
  messages.value.push(message);
  
  emit('messageAdded', message);

  // 滚动到底部
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
  
  return messageId;
};

// 更新消息内容
const updateMessage = (messageId: string, content: string, reasoning?: string) => {
  const messageIndex = messages.value.findIndex(msg => msg.id === messageId);
  
  if (messageIndex !== -1) {
    const oldMessage = messages.value[messageIndex];
    
    messages.value[messageIndex] = {
      ...oldMessage,
      content: content,
      ...(reasoning !== undefined && { reasoning: reasoning })
    };
    
    // 滚动到底部
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  }
};

// 完成流式输出
const finishStreaming = (messageId: string) => {
  const messageIndex = messages.value.findIndex(msg => msg.id === messageId);
  if (messageIndex !== -1) {
    messages.value[messageIndex] = {
      ...messages.value[messageIndex],
      streaming: false
    };
  }
  isStreaming.value = false;
  currentStreamingMessageId.value = null;
  abortController.value = null;
};

// 终止流式请求
const abortStreaming = () => {
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
  }
  
  if (currentStreamingMessageId.value) {
    const messageIndex = messages.value.findIndex(msg => msg.id === currentStreamingMessageId.value);
    if (messageIndex !== -1) {
      const currentContent = messages.value[messageIndex].content;
      const currentReasoning = messages.value[messageIndex].reasoning;
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        streaming: false,
        content: currentContent + `\n\n${t('tools.aichat.core.terminated')}`,
        reasoning: currentReasoning
      };
    }
    finishStreaming(currentStreamingMessageId.value);
  }
};

// 获取AI提供者
const aiProvider = computed(() => {
  const provider = aiManager.getProvider(selectedProvider.value.provider);
  if (!provider) {
    console.error(`${selectedProvider.value.provider} AI提供者未找到`);
  }
  return provider;
});

// 调用AI接口
const callAIAPI = async () => {
  console.log('=== callAIAPI 开始 ===');
  console.log('aiProvider.value:', !!aiProvider.value);
  
  if (!aiProvider.value) {
    const errorMsg = `${selectedProvider.value.provider} AI提供者未配置，请检查环境变量配置`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  if (!aiProvider.value.chat) {
    const errorMsg = `${selectedProvider.value.provider} AI提供者不支持对话功能`;
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    console.log('1. 构建对话历史');
    console.log('当前消息数量:', messages.value.length);
    
    // 构建对话历史
    const conversationHistory = messages.value.map((msg) => {
      let role: "user" | "assistant" | "system";
      if (msg.type === "user") {
        role = "user";
      } else if (msg.type === "assistant") {
        role = "assistant";
      } else {
        role = "system";
      }

      return {
        role: role,
        content: msg.content,
      };
    });

    // 如果有系统提示词，添加到开头
    if (systemPrompt.value && conversationHistory.length >= 0) {
      console.log('2. 添加系统提示词到对话历史');
      conversationHistory.unshift({
        role: "system",
        content: systemPrompt.value
      });
    }
    
    console.log('最终对话历史长度:', conversationHistory.length);
    console.log('对话历史:', conversationHistory);

    console.log('3. 创建助手消息');
    // 创建流式输出的助手消息
    const assistantMessageId = addMessage("assistant", "", true);
    currentStreamingMessageId.value = assistantMessageId;
    isStreaming.value = true;

    console.log('4. 创建终止控制器');
    // 创建终止控制器
    abortController.value = new AbortController();

    let accumulatedContent = '';
    let accumulatedReasoning = '';

    console.log('5. 调用AI提供者chat方法');
    const response = await aiProvider.value.chat(
      conversationHistory,
      {
        model: selectedProvider.value.model,
        temperature: 0.7,
        maxTokens: 2000,
        stream: true,
        signal: abortController.value.signal,
        onChunk: (chunk: string, reasoning?: string) => {
          console.log('收到chunk:', chunk.length, '字符');
          accumulatedContent += chunk;
          if (reasoning) {
            accumulatedReasoning += reasoning;
          }
          updateMessage(assistantMessageId, accumulatedContent, accumulatedReasoning);
        }
      }
    );

    console.log('6. AI响应完成');
    // 完成流式输出
    finishStreaming(assistantMessageId);

    // 如果流式输出没有内容，使用响应内容
    const currentMessage = messages.value.find(msg => msg.id === assistantMessageId);
    if (currentMessage && !currentMessage.content.trim()) {
      console.log('7. 使用备用响应内容');
      const content = typeof response === 'string' ? response : (response?.content || t('tools.aichat.core.error_no_response'));
      updateMessage(assistantMessageId, content);
    }
    
    console.log('✅ callAIAPI 完成');

  } catch (error) {
    console.error("❌ AI接口调用出错:", error);
    
    // 检查是否是用户主动终止
    if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
      console.log('用户主动终止请求');
      return;
    }
    
    // 处理失败消息
    if (currentStreamingMessageId.value) {
      const messageIndex = messages.value.findIndex(msg => msg.id === currentStreamingMessageId.value);
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...messages.value[messageIndex],
          failed: true,
          streaming: false,
          content: t('tools.aichat.core.error_generic')
        };
      }
      finishStreaming(currentStreamingMessageId.value);
    } else {
      const failedMessage: Message = {
        id: generateMessageId(),
        type: 'assistant',
        content: t('tools.aichat.core.error_generic'),
        timestamp: Date.now(),
        failed: true
      };
      messages.value.push(failedMessage);
    }
    
    throw error;
  }
};

// 处理用户输入
const handleUserInput = async (content: string) => {
  if (!content.trim() || loading.value || isSubmitting.value || isStreaming.value) return;

  isSubmitting.value = true;

  try {
    // 添加用户消息
    addMessage("user", content);
    
    // 如果是第一条用户消息，触发对话开始事件
    if (messages.value.filter(m => m.type === 'user').length === 1) {
      emit('conversationStarted');
    }

    // 调用AI接口
    await callAIAPI();
  } catch (error) {
    console.error("AI接口调用失败:", error);
    if (typeof error === 'object' && error !== null && 'name' in error && !(error as any).name || (error as any).name !== 'AbortError') {
      addMessage("assistant", t('tools.aichat.core.error_generic'));
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 清空聊天记录
const clearChat = () => {
  if (isStreaming.value) {
    abortStreaming();
  }
  
  messages.value = [];
  isStreaming.value = false;
  currentStreamingMessageId.value = null;
  abortController.value = null;
};

// 处理供应商变更
const handleProviderChange = (selection: ProviderSelection) => {
  console.log('AiChatCore 供应商变更:', selection);
  selectedProvider.value = selection;
  
  // 发射供应商变更事件给父组件
  emit('providerChanged', selection);
  
  // 移除自动开始AI对话的逻辑，让父组件决定如何处理
  // if (selection.provider && selection.model && systemPrompt.value && messages.value.length === 0) {
  //   console.log('供应商已选择，自动开始AI对话');
  //   // 延迟一下确保组件状态更新完成
  //   nextTick(() => {
  //     setTimeout(() => {
  //       startAIConversation();
  //     }, 100);
  //   });
  // }
};

// 重试功能
const handleRetry = (messageId: string) => {
  const messageIndex = messages.value.findIndex(msg => msg.id === messageId)
  if (messageIndex === -1) return
  
  // 删除失败的消息及其之后的所有消息
  messages.value.splice(messageIndex)
  
  // 找到最后一条用户消息
  const lastUserMessage = [...messages.value].reverse().find(msg => msg.type === 'user')
  if (!lastUserMessage) return
  
  // 重新调用AI接口
  try {
    callAIAPI()
  } catch (error) {
    console.error("重试失败:", error)
    addMessage("assistant", t('tools.aichat.core.error_generic'))
  }
}

// 自动发送提示词
const autoSendPrompt = async (prompt: string) => {
  if (selectedProvider.value.provider && selectedProvider.value.model) {
    await nextTick();
    handleUserInput(prompt);
  }
};

// 设置系统提示词
const setSystemPrompt = (prompt: string) => {
  systemPrompt.value = prompt;
};

// AI主动开始对话
const startAIConversation = async () => {
  console.log('=== startAIConversation 开始 ===');
  console.log('selectedProvider:', selectedProvider.value);
  console.log('systemPrompt 长度:', systemPrompt.value.length);
  console.log('systemPrompt 前100字符:', systemPrompt.value.substring(0, 100));
  
  if (!selectedProvider.value.provider || !selectedProvider.value.model) {
    console.warn('❌ AI供应商或模型未选择');
    console.warn('provider:', selectedProvider.value.provider);
    console.warn('model:', selectedProvider.value.model);
    return;
  }

  if (isSubmitting.value || isStreaming.value) {
    console.log('❌ 正在提交或流式输出中，跳过');
    console.log('isSubmitting:', isSubmitting.value);
    console.log('isStreaming:', isStreaming.value);
    return;
  }

  console.log('✅ 开始AI对话流程');
  isSubmitting.value = true;

  try {
    console.log('1. 触发对话开始事件');
    // 触发对话开始事件
    emit('conversationStarted');

    console.log('2. 调用 callAIAPI');
    // 直接调用AI接口，让AI根据系统提示词自动生成开场白
    await callAIAPI();
    console.log('✅ callAIAPI 调用完成');
  } catch (error) {
    console.error("❌ AI主动对话失败:", error);
    addMessage("assistant", t('tools.aichat.core.error_generic'));
  } finally {
    console.log('3. 重置提交状态');
    isSubmitting.value = false;
  }
  
  console.log('=== startAIConversation 结束 ===');
};

// 添加AI开场白的便捷方法
const addAIGreeting = (greeting: string) => {
  addMessage("assistant", greeting);
};

// 暴露方法给父组件
defineExpose({
  clearChat,
  autoSendPrompt,
  addMessage,
  setSystemPrompt,
  startAIConversation,
  addAIGreeting,
  handleUserInput,
  messages: computed(() => messages.value),
  selectedProvider: computed(() => selectedProvider.value)
});
</script>

<template>
  <div class="ai-chat-core">
    <!-- AI供应商选择器 -->
    <div class="mb-4">
      <AiProviderSelector 
        v-model="selectedProvider"
        @change="handleProviderChange"
        :storage-key="storageKey || 'ai-chat-provider-selection'"
      />
    </div>

    <!-- 只有在选择了供应商和模型后才显示聊天界面 -->
    <div v-if="selectedProvider.provider && selectedProvider.model" class="p-4 rounded-2xl bg-white">
      <!-- 聊天界面 -->
      <div class="flex flex-col h-[600px]">
        <!-- 聊天记录区域 -->
        <div
          ref="chatContainer"
          class="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50 mb-4"
        >
          <!-- 欢迎消息 -->
          <div
            v-if="messages.length === 0"
            class="text-center text-gray-500 py-8"
          >
            <div class="text-2xl mb-2">🤖</div>
            <div class="text-lg font-medium mb-2">{{ title }}</div>
            <div class="text-sm">{{ t('tools.aichat.core.welcome_msg') }}</div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="space-y-4">
            <ChatMessage
              v-for="message in messages"
              :key="message.id"
              :message="message"
              @retry="handleRetry"
            />
          </div>
        </div>

        <!-- 输入区域 -->
        <ChatInput 
          @send="handleUserInput" 
          @abort="abortStreaming"
          :loading="loading || isSubmitting" 
          :streaming="isStreaming"
        />

        <!-- 操作按钮 -->
        <div class="flex justify-end mt-2">
          <button
            @click="clearChat"
            class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            {{ t('tools.aichat.core.clear_chat') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 如果没有选择供应商和模型，显示提示 -->
    <div v-else class="mt-4 p-6 text-center bg-gray-50 rounded-lg">
      <div class="text-gray-500">
        <div class="text-lg mb-2">🤖</div>
        <div class="text-base font-medium mb-2">{{ t('tools.aichat.core.init_provider') }}</div>
        <div class="text-sm">{{ t('tools.aichat.core.auto_select') }}</div>
      </div>
    </div>
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
</style>