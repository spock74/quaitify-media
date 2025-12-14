import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Garante que o output vá para 'dist' conforme esperado pelo Dockerfile
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // Proxy para desenvolvimento local
    // Redireciona chamadas /api para o backend Python rodando na porta 8000
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})