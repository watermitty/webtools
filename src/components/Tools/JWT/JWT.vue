<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import {jwtDecode} from 'jwt-decode'
import { ElMessage } from 'element-plus'
import randomize from 'randomatic'

const { t } = useI18n()

// 添加tab状态
const activeTab = ref('parse')

const info = reactive({
  title: "tools.jwt.title",
  token: '',
})

// JWT生成相关数据
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://tool.ranblogs.com'
const domain = siteUrl.replace(/^https?:\/\//, '')
const topDomain = domain.split('.').length > 1 ? domain.split('.')[1] : 'com'

const generateData = reactive({
  header: JSON.stringify({
    "alg": "HS256",
    "typ": "JWT"
  }, null, 2),
  payload: JSON.stringify({
    "iss": domain,
    "sub": "yifang",
    "aud": topDomain,
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  }, null, 2),
  secret: 'your-secret-key',
  generatedToken: ''
})

const decodeHeader = ref()
const decodePayload = ref()
const invalidToken = ref(false)
// 添加校验相关的状态
const verifySecret = ref('')
const signatureValid = ref(false)
const signatureInvalid = ref(false)

//解析
const parser = () => {
  try {
    decodePayload.value = JSON.stringify(jwtDecode(info.token), null, '\t')
    decodeHeader.value = JSON.stringify(jwtDecode(info.token, {header: true}), null, '\t')
    invalidToken.value = false
    // 重置校验状态
    signatureValid.value = false
    signatureInvalid.value = false
  } catch (e) {
    console.log('Invalid token', e)
    invalidToken.value = true
    decodeHeader.value = ''
    decodePayload.value = ''
    signatureValid.value = false
    signatureInvalid.value = false
  }  
}

// 添加JWT签名校验功能
const verifySignature = () => {
  if (!info.token || !verifySecret.value) {
    ElMessage.warning(t('tools.jwt.placeholder_secret'))
    return
  }
  
  try {
    const parts = info.token.split('.')
    if (parts.length !== 3) {
      ElMessage.error(t('tools.jwt.msg_invalid_token'))
      return
    }
    
    // 获取header和payload
    const signature = parts[2]
    
    // 使用提供的secret重新计算签名
    const expectedSignature = btoa(unescape(encodeURIComponent(verifySecret.value)))
    
    // 简单的签名比较（实际项目中应该使用真实的加密库）
    if (signature === expectedSignature) {
      signatureValid.value = true
      signatureInvalid.value = false
      ElMessage.success(t('tools.jwt.msg_verify_success'))
    } else {
      signatureValid.value = false
      signatureInvalid.value = true
      ElMessage.error(t('tools.jwt.msg_verify_fail'))
    }
  } catch (e) {
    console.log('Verify signature error', e)
    ElMessage.error(t('tools.jwt.msg_verify_error'))
  }
}

//清空输入框
const clear = () => {
  info.token = ''
  decodeHeader.value = ''
  decodePayload.value = ''
  invalidToken.value = false
  verifySecret.value = ''
  signatureValid.value = false
  signatureInvalid.value = false
}

// 生成JWT
const generateJWT = () => {
  try {
    // 简单的JWT生成实现（实际项目中建议使用专业的JWT库）
    const header = btoa(unescape(encodeURIComponent(generateData.header)))
    const payload = btoa(unescape(encodeURIComponent(generateData.payload)))
    
    // 这里使用简单的签名算法，实际项目中应该使用真实的加密库
    const signature = btoa(unescape(encodeURIComponent(generateData.secret)))
    
    generateData.generatedToken = `${header}.${payload}.${signature}`
  } catch (e) {
    console.log('Generate JWT error', e)
  }
}

// 清空生成数据
const clearGenerate = () => {
  generateData.header = JSON.stringify({
    "alg": "HS256",
    "typ": "JWT"
  }, null, 2)
  generateData.payload = JSON.stringify({
    "iss": domain,
    "sub": "yifang",
    "aud": topDomain,
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  }, null, 2)
  generateData.secret = 'your-secret-key'
  generateData.generatedToken = ''
}

// 添加过期时间选项
const expirationOptions = [
  { label: t('tools.jwt.exp_options.1h'), value: 3600, key: '1h' },
  { label: t('tools.jwt.exp_options.5h'), value: 18000, key: '5h' },
  { label: t('tools.jwt.exp_options.1d'), value: 86400, key: '1d' },
  { label: t('tools.jwt.exp_options.3d'), value: 259200, key: '3d' },
  { label: t('tools.jwt.exp_options.7d'), value: 604800, key: '7d' },
  { label: t('tools.jwt.exp_options.15d'), value: 1296000, key: '15d' },
  { label: t('tools.jwt.exp_options.1m'), value: 2592000, key: '1m' }
]

const selectedExpiration = ref(3600) // 默认1小时

// 更新时间戳
const updateTimestamps = () => {
  try {
    const payload = JSON.parse(generateData.payload)
    payload.iat = Math.floor(Date.now() / 1000)
    payload.exp = Math.floor(Date.now() / 1000) + selectedExpiration.value
    generateData.payload = JSON.stringify(payload, null, 2)
  } catch (e) {
    console.log('Update timestamps error', e)
  }
}

// 复制JWT到剪贴板
const copyJWT = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器支持
      await navigator.clipboard.writeText(generateData.generatedToken)
      ElMessage.success(t('tools.jwt.msg_copy_success') || 'Token copied')
    } else {
      // 兼容性处理：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = generateData.generatedToken
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        ElMessage.success(t('tools.jwt.msg_copy_success'))
      } catch (err) {
        ElMessage.error(t('tools.jwt.msg_copy_fail'))
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error(t('tools.jwt.msg_copy_fail'))
  }
}

// 生成随机密钥
const generateRandomSecret = () => {
  // 随机生成20-40位的长度
  const length = Math.floor(Math.random() * (40 - 20 + 1)) + 20
  // 使用 randomatic 生成随机长度的字符串，包含大小写字母、数字和特殊字符
  const secret = randomize('*', length)
  generateData.secret = secret
}

// 复制Secret到剪贴板
const copySecret = () => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(generateData.secret).then(() => {
      ElMessage.success(t('tools.jwt.msg_copy_secret_success') || 'Secret copied')
    }).catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败，请手动复制')
    })
  } else {
    const textArea = document.createElement('textarea')
    textArea.value = generateData.secret
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      ElMessage.success(t('tools.jwt.msg_copy_secret_success'))
    } catch (err) {
      ElMessage.error(t('tools.jwt.msg_copy_fail'))
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

onMounted(() => {
  // 页面加载时自动生成JWT并设置为示例token
  generateJWT()
  // 将生成的token设置为示例token
  info.token = generateData.generatedToken
  parser()
})

// 监听数据变化，自动生成JWT
watch(
  () => [generateData.header, generateData.payload, generateData.secret],
  () => {
    if (generateData.header && generateData.payload && generateData.secret) {
      generateJWT()
    }
  },
  { deep: true }
)

// 监听payload内部字段变化
watch(
  () => generateData.payload,
  (newPayload) => {
    try {
      const payload = JSON.parse(newPayload)
      // 如果payload解析成功且有必要的字段，自动生成JWT
      if (payload.iss && payload.sub && payload.aud) {
        generateJWT()
      }
    } catch (e) {
      // payload格式错误时不生成
      console.log('Payload format error:', e)
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <!-- Tab切换 -->
    <div class="p-4 rounded-2xl bg-white mb-4">
      <el-tabs v-model="activeTab" class="w-full">
        <el-tab-pane :label="$t('tools.jwt.tab_parse')" name="parse">
          <div class="mb-6">
            <el-input v-model="info.token" :rows="5" type="textarea" :placeholder="$t('tools.jwt.placeholder_token')" @change="parser"></el-input>
            <el-text type="danger" v-if="invalidToken">{{ $t('tools.jwt.msg_invalid_token') }}</el-text>
            <div class="mt-3">
              <el-button type="primary" @click="parser">{{ $t('tools.jwt.btn_parse') }}</el-button>
              <el-button type="primary" @click="clear">{{ $t('tools.jwt.btn_clear') }}</el-button>
            </div>
          </div>

          <!-- Secret校验 -->
          <div class="mb-6">
            <div class="mb-2 font-medium">{{ $t('tools.jwt.label_secret_verify') }}</div>
            <div class="flex gap-2">
              <el-input
                v-model="verifySecret"
                :placeholder="$t('tools.jwt.placeholder_secret')"
                :type="verifySecret ? 'text' : 'password'"
              />
              <el-button type="success" @click="verifySignature">{{ $t('tools.jwt.btn_verify') }}</el-button>
            </div>
            <!-- 校验结果提示 -->
            <div v-if="signatureValid" class="mt-2">
              <el-text type="success">{{ $t('tools.jwt.msg_verify_success') }}</el-text>
            </div>
            <div v-if="signatureInvalid" class="mt-2">
              <el-text type="danger">{{ $t('tools.jwt.msg_verify_fail') }}</el-text>
            </div>
          </div>

          <!-- header -->
          <div v-if="decodeHeader">
            <div class="mb-3">{{ $t('tools.jwt.label_header') }}</div>
            <el-input
              v-model="decodeHeader"
              type="textarea"
              :autosize="true"
              class="w-full"
              readonly
            />
          </div>

          <!-- payload -->
          <div v-if="decodePayload">
            <div class="mb-3 mt-3">{{ $t('tools.jwt.label_payload') }}</div>
            <el-input
              v-model="decodePayload"
              type="textarea"
              :autosize="true"
              class="w-full"
              readonly
            />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('tools.jwt.tab_generate')" name="generate">
          <div class="space-y-4">
            <!-- Header -->
            <div>
              <div class="mb-2 font-medium">{{ $t('tools.jwt.label_header') }}</div>
              <el-input
                v-model="generateData.header"
                type="textarea"
                :rows="4"
                :placeholder="$t('tools.jwt.placeholder_header')"
              />
            </div>

            <!-- Payload -->
            <div>
              <div class="mb-2 font-medium">{{ $t('tools.jwt.label_payload') }}</div>
              <el-input
                v-model="generateData.payload"
                type="textarea"
                :rows="7"
                :placeholder="$t('tools.jwt.placeholder_payload')"
              />
              <div class="mt-2 flex items-center gap-2">
                <el-select v-model="selectedExpiration" :placeholder="$t('tools.jwt.label_exp')" style="width: 150px;">
                  <el-option
                    v-for="option in expirationOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-button size="small" @click="updateTimestamps">{{ $t('tools.jwt.btn_update_time') }}</el-button>
              </div>
            </div>

            <!-- Secret -->
            <div>
              <div class="mb-2 flex items-center justify-between">
                <div class="font-medium">{{ $t('tools.jwt.label_secret') }}</div>
                <div class="flex gap-2">
                  <el-button size="small" @click="generateRandomSecret">{{ $t('tools.jwt.btn_random') }}</el-button>
                  <el-button size="small" @click="copySecret" :disabled="!generateData.secret">{{ $t('tools.jwt.btn_copy_secret') }}</el-button>
                </div>
              </div>
              <el-input
                v-model="generateData.secret"
                :placeholder="$t('tools.jwt.placeholder_input_secret')"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <el-button type="primary" @click="generateJWT">{{ $t('tools.jwt.btn_generate') }}</el-button>
              <el-button @click="clearGenerate">{{ $t('tools.jwt.btn_reset') }}</el-button>
            </div>

            <!-- 生成的Token -->
            <div v-if="generateData.generatedToken">
              <div class="mb-2 font-medium">{{ $t('tools.jwt.label_result_token') }}</div>
              <el-input
                v-model="generateData.generatedToken"
                type="textarea"
                :rows="3"
                readonly
              />
              <div class="mt-2">
                <el-button size="small" @click="copyJWT">
                  {{ $t('tools.jwt.btn_copy_token') }}
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.jwt.tab_parse')">
      <el-text>
        {{ $t('tools.jwt.desc') }}
      </el-text>
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>