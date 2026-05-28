# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, Aider, etc.) working in this repository. `CLAUDE.md` is a symlink to this file for Claude Code auto-loading.

## Commands

- `bun install` — install deps (Docker uses `--frozen-lockfile`)
- `bun run dev` — Astro dev server on port 4321
- `bun run build` — static build to `./dist` (Cloudflare adapter also emits `dist/_worker.js`)
- `bun run preview` — preview built site
- `bun run deploy` — `astro build && wrangler deploy` to Cloudflare Workers
- `docker compose up --build` — dev container with HMR via bind mount (port 4321)
- `docker compose -f docker-compose.prod.yml up --build` — Nginx-served prod build (port 8080)
- No test runner or linter configured. Type checking: `bunx astro check` (not wired into a script).

## Architecture

**Astro 5 SSG + Cloudflare Workers adapter** ([astro.config.mjs](astro.config.mjs)). Build emits both static `dist/` assets and `dist/_worker.js`. [wrangler.jsonc](wrangler.jsonc) binds `./dist` as `ASSETS` and points `main` at the worker entry. Two deploy paths coexist:

- Cloudflare Workers via `bun run deploy`
- Static Nginx via `docker-compose.prod.yml` — ignores the worker, serves `dist/` directly.

**Path alias**: `@/*` → `src/*` ([tsconfig.json](tsconfig.json)). Use `@/config` etc., not relative imports across `src/`.

**Central config funnel**: [src/config/index.ts](src/config/index.ts) re-exports `siteConfig` composed of [site.ts](src/config/site.ts), [navigation.ts](src/config/navigation.ts), [home.ts](src/config/home.ts). All page content (hero, profile, stack, projects, social links) is data-driven from here — edit config, not JSX. `homeConfig` is typed via a local `HomeConfig` interface in [home.ts](src/config/home.ts).

**Content collections**: blog posts live in [src/content/blog/](src/content/blog/) as folders containing `index.md` plus co-located images. Schema enforced in [src/content/config.ts](src/content/config.ts): `title`, `pubDate` (Date), `description`. Rendered by dynamic route [src/pages/blog/[...slug].astro](src/pages/blog/%5B...slug%5D.astro) via `getStaticPaths` + `post.render()`. Home page surfaces the 3 most recent posts (sorted by `pubDate`).

**Layouts**: single [Layout.astro](src/layouts/Layout.astro) wraps everything — nav + mobile menu + footer + GSAP page-in. Posts additionally wrap in [PostLayout.astro](src/components/PostLayout.astro), which applies `prose prose-invert prose-emerald` typography.

**GSAP animations**: registered with `ScrollTrigger`. First-visit intro is gated by `sessionStorage.hasVisited` in [Layout.astro](src/layouts/Layout.astro) — subsequent navigations skip body fade-in and navbar stagger. Page-level animations (hero stagger, section reveals, project/blog card reveals, stack list stagger) live in the inline `<script>` of [src/pages/index.astro](src/pages/index.astro), keyed off classes `.hero-text`, `.gsap-section`, `.stagger-list`, `.project-card`, `.blog-card`.

**Styling**: Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Theme tokens declared inline in CSS via `@theme` in [src/styles/global.css](src/styles/global.css). Fonts (`Inter`, `JetBrains Mono`) loaded from Google Fonts in [Layout.astro](src/layouts/Layout.astro). Typography plugin enabled via `@plugin "@tailwindcss/typography"`. Dark aesthetic hardcoded: black bg, emerald-500 accent, neutral grays.

**No client framework**: zero React/Vue/Svelte despite `tsconfig` setting `jsx: react-jsx`. Everything is `.astro` components plus vanilla JS in inline scripts.

## Conventions

- Mobile menu state, burger animation, and first-visit fade live entirely in one inline `<script>` in [Layout.astro](src/layouts/Layout.astro) — bundled by Astro, not loaded separately.
- Adding a blog post: create `src/content/blog/<slug>/index.md` with frontmatter `{ title, pubDate, description }`. Slug is the folder name. Static paths regenerate on build.
- Project entries support either a single `link` or a multi `links` array — index page branches on whichever is set ([src/pages/index.astro:104-118](src/pages/index.astro#L104-L118)).
- License split: code is MIT, blog content under `src/content/` is © reserved ([README.md](README.md)).
