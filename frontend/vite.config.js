import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: readFileSync(join(__dirname, 'backend/certs/server.key')),
      cert: readFileSync(join(__dirname, 'backend/certs/server.crt')),
    },
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