import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import plugin from './plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [plugin(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    __VUE_OPTIONS_API__: false,
  }
})
