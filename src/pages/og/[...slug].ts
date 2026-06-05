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
    bgGradient: [
      [10, 10, 10],
      [0, 0, 0],
    ],
    border: { color: [16, 185, 129], width: 16, side: 'inline-start' },
    padding: 64,
    font: {
      title: {
        color: [255, 255, 255],
        size: 64,
        weight: 'Bold',
        lineHeight: 1.2,
      },
      description: {
        color: [163, 163, 163],
        size: 30,
        lineHeight: 1.4,
      },
    },
  }),
});
