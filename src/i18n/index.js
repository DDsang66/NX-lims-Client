import { createI18n } from 'vue-i18n'
import Chinese from '../locales/Chinese.js'
import English from '../locales/English.js'

const i18n = createI18n({
  locale: 'Chinese', // 使用的语言
  fallbackLocale: 'English', // 语言包中不存在时，使用的备用语言
  messages: {
    'Chinese': Chinese,
    'English': English
  },
  legacy: false, // 使用 Composition API 模式
  globalInjection: true,// 允许使用 $t 等全局方法
  global: true
})

export default i18n
