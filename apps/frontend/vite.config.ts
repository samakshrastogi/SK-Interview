import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5476,
    proxy: {
      '/api': {
        target: 'http://localhost:4003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
