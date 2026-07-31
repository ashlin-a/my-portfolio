import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { siteConfig } from '@/config';

// One generated 1200x630 OG image per blog post (keyed by post id),
// plus a `default` image used as the site-wide social fallback.
const posts = await getCollection('blog');
const pages: Record<string, { title: string; description: string }> = {
  default: {
    title: siteConfig.site.titleDefault,
    description: siteConfig.site.description,
  },
  ...Object.fromEntries(
    posts.map((post) => [post.id, { title: post.data.title, description: post.data.description }])
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_id, page: (typeof pages)[string]) => ({
    title: page.title,
    description: page.description,
    // Paper + ink blue, matching the site's light palette.
    bgGradient: [
      [251, 250, 247],
      [240, 237, 230],
    ],
    border: { color: [29, 63, 143], width: 16, side: 'inline-start' },
    padding: 64,
    // Same faces as the site: Instrument Serif for the title, Inter for the
    // description. Instrument Serif ships 400 only, so the title stays Normal.
    fonts: [
      'https://api.fontsource.org/v1/fonts/instrument-serif/latin-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
    ],
    font: {
      title: {
        color: [25, 23, 20],
        families: ['Instrument Serif'],
        size: 72,
        weight: 'Normal',
        lineHeight: 1.15,
      },
      description: {
        color: [110, 103, 89],
        families: ['Inter'],
        size: 30,
        lineHeight: 1.4,
      },
    },
  }),
});
