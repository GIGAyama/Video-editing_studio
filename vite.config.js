import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Video-editing_studio/', // GitHub Pagesのリポジトリ名に合わせて設定
})
