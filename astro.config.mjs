// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers';

// https://astro.build/config
export default defineConfig({
  site: 'https://ashlin.dev',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/og/'),
    }),
  ],

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
  },
});
