import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy para a API pública do Instagram, contornando CORS em desenvolvimento.
      // Em produção, o frontend usa a Cloud Function `fetchInstagramProfile`.
      '/ig-api': {
        target: 'https://i.instagram.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ig-api/, ''),
        headers: {
          'X-IG-App-ID': '936619743392459',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers['x-session-id']) {
              proxyReq.setHeader('Cookie', `sessionid=${req.headers['x-session-id']}`);
            }
          });
        },
      },
    },
  },
});
