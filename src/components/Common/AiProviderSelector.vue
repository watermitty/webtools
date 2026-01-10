<template>
  <div class="ai-provider-selector">
    <!-- 添加加载提示 -->
    <div v-if="isLoadingModels" class="loading-indicator">
      <span>{{ t('tools.aichat.provider.loading_models') }}</span>
    </div>
    
    <!-- 添加错误提示 -->
    <div v-if="modelsLoadError" class="error-indicator">
      <span>⚠️ {{ modelsLoadError }}</span>
      <button @click="fetchPollinationsModels" class="retry-button">{{ t('tools.aichat.provider.retry') }}</button>
    </div>

    <div class="selector-row">
      <!-- 供应商选择 -->
      <div class="selector-item">
        <label class="selector-label">{{ t('tools.aichat.provider.label_provider') }}</label>
        <select 
          v-model="selectedProvider" 
          @change="handleProviderChange"
          class="selector-select"
        >
          <option value="">{{ t('tools.aichat.provider.placeholder_provider') }}</option>
          <option 
            v-for="provider in availableProviders" 
            :key="provider.name" 
            :value="provider.name"
          >
            {{ provider.displayName }}
          </option>
        </select>
        <div class="selector-desc">{{ getSelectedProviderDesc() }}</div>
      </div>

      <!-- 模型选择 -->
      <div class="selector-item">
        <label class="selector-label">{{ t('tools.aichat.provider.label_model') }}</label>
        <select 
          v-model="selectedModel" 
          @change="handleModelChange"
          class="selector-select"
          :disabled="!selectedProvider || isLoadingModels"
        >
          <option value="">
            {{ isLoadingModels ? t('tools.aichat.provider.loading') : t('tools.aichat.provider.placeholder_model') }}
          </option>
          <option 
            v-for="model in availableModels" 
            :key="model.name" 
            :value="model.name"
          >
            {{ model.name }}
          </option>
        </select>
        <div class="selector-desc">
          {{ isLoadingModels && selectedProvider === 'pollinations' ? t('tools.aichat.provider.fetching_models') : getSelectedModelDesc() }}
        </div>
      </div>
    </div>

    <!-- 当前选择显示 -->
    <div v-if="selectedProvider && selectedModel" class="current-selection">
      <div class="selection-info">
        <span class="selection-label">{{ t('tools.aichat.provider.current_selection') }}</span>
        <span class="selection-value">{{ getProviderDisplayName(selectedProvider) }} - {{ selectedModel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const pollinationsTextUrl = ref(import.meta.env.VITE_POLLINATIONS_TEXT_URL);

// 定义模型接口类型
interface ModelData {
  name: string
  description?: string
  provider?: string
  reasoning?: boolean
  vision?: boolean
  audio?: boolean
  tools?: boolean
  community?: boolean
  [key: string]: any
}

// 定义组件的props和emits
interface Props {
  modelValue?: {
    provider: string
    model: string
  }
  placeholder?: string
  storageKey?: string // 新增：存储键名，用于区分不同页面的选择
}

interface Emits {
  (e: 'update:modelValue', value: { provider: string; model: string }): void
  (e: 'change', value: { provider: string; model: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ provider: '', model: '' }),
  placeholder: '请选择',
  storageKey: 'ai-provider-selection' // 默认存储键名
})

const emit = defineEmits<Emits>()

// 供应商数据
// Use computed for i18n
const availableProviders = computed(() => [
  {
    name: 'pollinations',
    displayName: 'Pollinations',
    description: t('tools.aichat.provider.desc_pollinations')
  },
  {
    name: 'aitools',
    displayName: 'AI Tools',
    description: t('tools.aichat.provider.desc_aitools')
  }
])

// 状态变量
const selectedProvider = ref('')
const selectedModel = ref('')
const isLoadingModels = ref(false)
const modelsLoadError = ref('')
const pollinationsModels = ref<ModelData[]>([])
const aitoolsModels = ref<ModelData[]>([
  { name: 'gpt-4o-mini', description: 'GPT-4o Mini' },
  { name: 'claude-3-haiku', description: 'Claude 3 Haiku' }
])

const fetchPollinationsModels = async () => {
  if (pollinationsModels.value.length > 0) return
  
  isLoadingModels.value = true
  modelsLoadError.value = ''
  try {
    const url = pollinationsTextUrl.value || 'https://text.pollinations.ai'
    const response = await axios.get(`${url}/models`)
    pollinationsModels.value = response.data
  } catch (error: any) {
    console.error('Failed to load models:', error)
    modelsLoadError.value = t('tools.aichat.provider.msg_load_error')
  } finally {
    isLoadingModels.value = false
  }
}

const handleProviderChange = () => {
  selectedModel.value = ''
  emit('update:modelValue', { provider: selectedProvider.value, model: '' })
  emit('change', { provider: selectedProvider.value, model: '' })
}

const handleModelChange = () => {
  const selection = { provider: selectedProvider.value, model: selectedModel.value }
  emit('update:modelValue', selection)
  emit('change', selection)
  saveToLocalStorage(selection)
}

const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(props.storageKey)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

const saveToLocalStorage = (data: { provider: string, model: string }) => {
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save selection:', e)
  }
}

const getProviderDisplayName = (providerName: string) => {
  const provider = availableProviders.value.find(p => p.name === providerName)
  return provider ? provider.displayName : providerName
}

const getSelectedProviderDesc = () => {
  if (!selectedProvider.value) return t('tools.aichat.provider.msg_select_provider')
  const provider = availableProviders.value.find(p => p.name === selectedProvider.value)
  return provider ? provider.description : ''
}

const getSelectedModelDesc = () => {
  if (!selectedProvider.value) return t('tools.aichat.provider.msg_select_provider')
  if (!selectedModel.value) return t('tools.aichat.provider.msg_select_model')
  
  const models = selectedProvider.value === 'pollinations' ? pollinationsModels.value : aitoolsModels.value
  const model = models.find(m => m.name === selectedModel.value)
  return model ? model.description : ''
}

// 初始化：优先使用props，如果没有则从本地存储加载，最后使用默认值
const initializeSelection = () => {
  console.log('=== initializeSelection 开始 ===');
  console.log('props.modelValue:', props.modelValue);
  
  if (props.modelValue.provider && props.modelValue.model) {
    console.log('使用 props 值');
    // 如果有props值，使用props
    selectedProvider.value = props.modelValue.provider;
    selectedModel.value = props.modelValue.model;
  } else {
    console.log('尝试从本地存储加载');
    // 如果没有props值，从本地存储加载
    const stored = loadFromLocalStorage();
    console.log('本地存储的值:', stored);
    
    if (stored.provider && stored.model) {
      console.log('使用本地存储的值');
      selectedProvider.value = stored.provider;
      selectedModel.value = stored.model;
      // 触发一次emit，让父组件知道初始值
      emit('update:modelValue', stored);
      emit('change', stored);
    } else {
      console.log('使用默认值');
      // 如果本地存储也没有数据，使用默认值（第一个供应商和第一个模型）
      const defaultProvider = availableProviders.value[0];
      console.log('默认供应商:', defaultProvider);
      console.log('pollinations模型数量:', pollinationsModels.value.length);
      
      const defaultModel = pollinationsModels.value[0]; // 默认使用pollinations的第一个模型
      console.log('默认模型:', defaultModel);

      if (defaultProvider && defaultModel) {
        console.log('设置默认选择');
        selectedProvider.value = defaultProvider.name;
        selectedModel.value = defaultModel.name;
        
        const defaultSelection = {
          provider: defaultProvider.name,
          model: defaultModel.name
        };
        
        console.log('默认选择:', defaultSelection);
        
        // 触发emit，让父组件知道默认值
        emit('update:modelValue', defaultSelection);
        emit('change', defaultSelection);
        
        // 保存默认选择到本地存储
        saveToLocalStorage(defaultSelection);
        
        console.log('✅ 默认选择设置完成');
      } else {
        console.log('❌ 无法设置默认选择');
        console.log('defaultProvider存在:', !!defaultProvider);
        console.log('defaultModel存在:', !!defaultModel);
        
        if (defaultProvider) {
          // 如果没有模型数据，至少设置供应商
          selectedProvider.value = defaultProvider.name;
          console.log('只设置了默认供应商');
        }
      }
    }
  }
  
  console.log('=== initializeSelection 结束 ===');
  console.log('最终选择:', { provider: selectedProvider.value, model: selectedModel.value });
};

// 监听props变化
watch(() => props.modelValue, (newValue) => {
  if (newValue.provider && newValue.model) {
    selectedProvider.value = newValue.provider
    selectedModel.value = newValue.model
  }
}, { deep: true })

// 组件挂载时初始化
onMounted(async () => {
  console.log('AiProviderSelector onMounted 开始');
  
  // 先获取模型列表，再初始化选择
  await fetchPollinationsModels();
  
  console.log('模型获取完成，pollinationsModels数量:', pollinationsModels.value.length);
  console.log('开始初始化选择...');
  
  initializeSelection();
  
  console.log('AiProviderSelector onMounted 完成');
});
</script>

<style scoped>
.ai-provider-selector {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.selector-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.selector-item {
  flex: 1;
  min-width: 0;
}

.selector-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.selector-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: border-color 0.2s ease;
}

.selector-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selector-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  position: relative;
}

/* 添加loading时的样式 */
.selector-select[disabled] {
  background: linear-gradient(90deg, #f9fafb 25%, #f1f5f9 50%, #f9fafb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 加载指示器添加动画 */
.loading-indicator::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.selector-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  min-height: 16px;
}

.current-selection {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selection-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.selection-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .selector-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .ai-provider-selector {
    padding: 12px;
  }
}

/* 新增加载和错误提示样式 */
.loading-indicator {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  color: #0c4a6e;
  font-size: 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-indicator {
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.retry-button {
  padding: 4px 8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}
</style>
