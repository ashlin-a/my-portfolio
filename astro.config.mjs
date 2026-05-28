// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// STATIC_ONLY=1 skips the Cloudflare adapter so the Nginx Docker build
// can produce a pure static dist/ without booting workerd (which hangs
// under Bun due to incomplete ws.WebSocket.upgrade impl).
const staticOnly = process.env.STATIC_ONLY === '1';

// https://astro.build/config
export default defineConfig({
  integrations: [],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['wrangler'],
    },
  },

  ...(staticOnly ? {} : { adapter: cloudflare() }),
});
