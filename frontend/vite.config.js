import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // critical so built HTML uses relative asset paths
  build: { outDir: 'dist', assetsDir: 'assets' }
})
