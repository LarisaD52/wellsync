import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['**/node_modules/**', '**/e2e/**', '**/backend1/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/data/**', 'src/hooks/useValidation.js'],
      exclude: ['**/node_modules/**', '**/e2e/**', '**/backend1/**', 'src/test/**'],
    },
  },
})
