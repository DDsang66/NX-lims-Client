import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(
  {
  plugins: [
    vue(),
    vueDevTools(),
    ],
  server: {
    host: '0.0.0.0',   // 或 '192.168.235.8'
    port: 5173
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 全局注入 variables.scss（注意结尾的 ;）
        additionalData: `@use "@/assets/css/style.scss" as *;`
      }
    }
  }
})
