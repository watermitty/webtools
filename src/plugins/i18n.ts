import { createI18n } from 'vue-i18n'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'

export function setupI18n(app: any, locale?: string) {
  const defaultLocale = locale || (localStorage.getItem('locale') || (navigator.language.startsWith('zh') ? 'zh' : 'en'))

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages: {
      zh,
      en,
    },
  })

  app.use(i18n)
  return i18n
}

export { }
