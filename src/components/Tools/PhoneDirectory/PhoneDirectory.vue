<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t, tm } = useI18n()

const info = reactive({
  title: "tools.phonedirectory.title",
})

// 电话号码数据
const phoneData = computed(() => tm('tools.phonedirectory.data') as any[])

// 搜索关键词
const searchKeyword = ref('')

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchKeyword.value) return phoneData.value
  
  return phoneData.value.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.includes(searchKeyword.value) || 
      item.number.includes(searchKeyword.value) ||
      item.desc.includes(searchKeyword.value)
    )
  })).filter(category => category.items.length > 0)
})

// 复制电话号码
const copyPhone = async (phone: string) => {
  await copy(phone)
}

// 拨打电话（移动端）
const callPhone = (phone: string) => {
  if (navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
    window.location.href = `tel:${phone}`
  } else {
    ElMessage.info('请在移动设备上使用拨号功能')
  }
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <!-- 搜索框 -->
      <div class="mb-6">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('tools.phonedirectory.search_placeholder')"
          clearable
          size="large"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 电话号码列表 -->
      <div class="phone-directory">
        <div 
          v-for="category in filteredData" 
          :key="category.category"
          class="category-section mb-8"
        >
          <h3 class="category-title">{{ category.category }}</h3>
          <div class="phone-grid">
            <div 
              v-for="item in category.items" 
              :key="item.number"
              class="phone-card"
            >
              <div class="phone-info">
                <div class="phone-name">{{ item.name }}</div>
                <div class="phone-desc">{{ item.desc }}</div>
              </div>
              <div class="phone-actions">
                <div class="phone-number">{{ item.number }}</div>
                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="copyPhone(item.number)"
                    class="action-btn"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    {{ $t('tools.phonedirectory.copy') }}
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="callPhone(item.number)"
                    class="action-btn"
                  >
                    <el-icon><Phone /></el-icon>
                    {{ $t('tools.phonedirectory.call') }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div v-if="filteredData.length === 0" class="no-results">
          <el-empty :description="$t('tools.phonedirectory.no_results')" />
        </div>
      </div>
    </div>

    <!-- 描述 -->
    <ToolDetail :title="$t('tools.phonedirectory.desc_title')">
      <el-text>
        <span v-html="$t('tools.phonedirectory.desc_content')"></span>
      </el-text> 
    </ToolDetail>

    <ToolDetail :title="$t('tools.phonedirectory.usage_title')">
      <el-text>
        <span v-html="$t('tools.phonedirectory.usage_content')"></span>
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>
.search-input {
  max-width: 500px;
}

.phone-directory {
  /* 移除滚动条相关样式 */
}

.category-section {
  margin-bottom: 2rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.phone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.phone-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.phone-card:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.phone-info {
  margin-bottom: 0.75rem;
}

.phone-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.phone-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.phone-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.phone-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
  font-family: 'Courier New', monospace;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .phone-grid {
    grid-template-columns: 1fr;
  }
  
  .phone-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  /* 移除移动端的滚动限制 */
}

/* 毛玻璃效果 */
.phone-card {
  backdrop-filter: blur(10px);
  background: rgba(249, 250, 251, 0.8);
}

.phone-card:hover {
  background: rgba(243, 244, 246, 0.9);
}
</style>
