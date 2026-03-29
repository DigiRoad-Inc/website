import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [tailwindcss(), react()],
  build: {
    emptyOutDir: false,
    outDir: 'js',
    lib: {
      entry: 'src/consent-entry.tsx',
      formats: ['iife'],
      name: 'DigiRoadConsent',
      fileName: () => 'dr-consent.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
