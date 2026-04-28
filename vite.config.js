import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // This proxies requests from http://localhost:5173/api/audit 
        // to your local Firebase Emulator running on port 5001.
        // Make sure to replace 'fairhire' with your actual Firebase project ID if different.
        target: 'http://127.0.0.1:5001/fairhire/us-central1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
