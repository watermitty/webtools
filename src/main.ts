import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
//入口文件main.ts全局安装element-plus,element-plus默认支持语言英语设置为中文
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enLocale from 'element-plus/dist/locale/en.mjs'
import { setupI18n } from './plugins/i18n'
//vite-plugin-svg-icons
import 'virtual:svg-icons-register'
//router
import router from './router'
//styles
import './styles/tailwind.css'
//element-plus css
import 'element-plus/dist/index.css'
//pinia
import pinia from './store'
//v-md-editor
import { setupMdEditor } from './plugins/v-md-editor'
//default-passive-events
import 'default-passive-events'
// v-viewer
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import { initializeAIProviders } from './spi/init'

// 初始化AI提供者
initializeAIProviders()

const app = createApp(App)

// 安载 pinia 和 路由
app.use(pinia)
app.use(router)

// 选择默认语言（localStorage 或 浏览器语言）
const defaultLocale = localStorage.getItem('locale') || (navigator.language.startsWith('zh') ? 'zh' : 'en')
const elLocale = defaultLocale === 'zh' ? zhCn : enLocale

// 安装 element-plus，并传入对应 locale
app.use(ElementPlus, {
  locale: elLocale,
})

// 安装 i18n
setupI18n(app, defaultLocale)

//安装v-md-editor
setupMdEditor(app)
// 安装 v-viewer
app.use(VueViewer)
//挂载应用
app.mount('#app')
