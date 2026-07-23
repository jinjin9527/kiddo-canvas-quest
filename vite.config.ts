import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // Quick Tunnel 会把 trycloudflare.com 放进 Host，必须放行
    allowedHosts: true,
  },
});
