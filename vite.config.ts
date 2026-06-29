import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/flight-performance-tool/',
  plugins: [react()],
  server: {
    proxy: {
      '/awc': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/awc/, ''),
      },
      '/ourairports-data': {
        target: 'https://davidmegginson.github.io',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});