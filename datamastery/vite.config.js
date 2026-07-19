import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'motion/react': 'framer-motion',
      'next/link': path.resolve(__dirname, './src/lib/next-link-stub.jsx'),
      '@/components/icons': path.resolve(__dirname, './src/components/icons.tsx'),
    },
  },
})
