import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración básica de Vite para ViajaYa
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
