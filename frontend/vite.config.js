import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base: '/',  // optional; default is '/'
  build: { outDir: 'dist', assetsDir: 'assets' }
})
