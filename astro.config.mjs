// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers';

// STATIC_ONLY=1 skips the Cloudflare adapter so the Nginx Docker build
// can produce a pure static dist/ without booting workerd (which hangs
// under Bun due to incomplete ws.WebSocket.upgrade impl).
const staticOnly = process.env.STATIC_ONLY === '1';

// https://astro.build/config
export default defineConfig({
  integrations: [],

  // Prevent @astrojs/cloudflare adapter from auto-injecting a SESSION KV
  // binding and triggering wrangler auto-provisioning on every deploy.
  // This site does not use sessions; lruCache is an in-memory no-op.
  session: {
    driver: sessionDrivers.lruCache(),
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        {
          name: 'code-enhancements',
          pre(node) {
            const lang = this.options.lang ?? '';

            if (lang) {
              node.children.unshift({
                type: 'element',
                tagName: 'span',
                properties: { class: 'code-lang' },
                children: [{ type: 'text', value: lang }],
              });
            }

            node.children.push({
              type: 'element',
              tagName: 'button',
              properties: { class: 'copy-btn', 'aria-label': 'Copy code' },
              children: [{ type: 'text', value: 'Copy' }],
            });
          },
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['wrangler'],
    },
  },

  ...(staticOnly ? {} : { adapter: cloudflare() }),
});
