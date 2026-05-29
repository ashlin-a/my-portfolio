# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, Aider, etc.) working in this repository. `CLAUDE.md` is a symlink to this file for Claude Code auto-loading.

## Commands

- `bun install` — install deps (Docker uses `--frozen-lockfile`). `prepare` script runs `lefthook install` when `.git` exists, no-ops otherwise (so containers don't fail).
- `bun run dev` — Astro dev server on port 4321
- `bun run build` — static build to `./dist` (Cloudflare adapter also emits `dist/_worker.js` unless `STATIC_ONLY=1`)
- `bun run preview` — preview built site
- `bun run deploy` — `astro build && wrangler deploy` to Cloudflare Workers
- `bun run lint` / `bun run lint:fix` — ESLint flat config
- `bun run format` / `bun run format:check` — Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`)
- `bun run typecheck` — `astro check` (also runs in `pre-push`)
- `docker compose up --build` — dev container with HMR via bind mount (port 4321)
- `docker compose -f docker-compose.prod.yml up --build` — Nginx-served prod build (port 8080)

## Architecture

**Astro 6 SSG + Cloudflare Workers adapter** ([astro.config.mjs](astro.config.mjs)). Build emits both static `dist/` assets and `dist/_worker.js`. Adapter 13 auto-manages `wrangler.jsonc` (`main`/`assets` are injected at build time — do not hand-author them). Two deploy paths coexist:

- Cloudflare Workers via `bun run deploy`
- Static Nginx via `docker-compose.prod.yml` — ignores the worker, serves `dist/` directly.

**`STATIC_ONLY=1` env gate** ([astro.config.mjs](astro.config.mjs)): drops the Cloudflare adapter so the build emits pure static `dist/` without booting `workerd`. Set in the Docker builder stage because `@cloudflare/vite-plugin` opens a WebSocket and Bun's incomplete `ws.WebSocket.upgrade` impl hangs the container forever. Host `bun run deploy` leaves it unset.

**Path alias**: `@/*` → `src/*` ([tsconfig.json](tsconfig.json), `paths` only — no `baseUrl`, TS 5+ resolves relative to tsconfig). Use `@/config` etc., not relative imports across `src/`.

**Central config funnel**: [src/config/index.ts](src/config/index.ts) re-exports `siteConfig` composed of [site.ts](src/config/site.ts), [navigation.ts](src/config/navigation.ts), [home.ts](src/config/home.ts). All page content (hero, profile, stack, projects, social links) is data-driven from here — edit config, not JSX. `homeConfig` is typed via a local `HomeConfig` interface in [home.ts](src/config/home.ts).

**Content collections (Astro 6 Loader API)**: blog posts live in [src/content/blog/](src/content/blog/) as folders containing `index.md` plus co-located images. Schema in [src/content.config.ts](src/content.config.ts) (note: root `src/content.config.ts`, not `src/content/config.ts`) — uses `loader: glob({ pattern: '**/index.md', base: './src/content/blog' })` and `z` imported from `astro/zod` (the `astro:content` re-export is deprecated). Rendered by dynamic route [src/pages/blog/[...slug].astro](src/pages/blog/%5B...slug%5D.astro) via `getStaticPaths` using `post.id` (was `post.slug` pre-v6) and `render(post)` imported from `astro:content` (was `post.render()` pre-v6). Home page surfaces the 3 most recent posts (sorted by `pubDate`).

**Layouts**: single [Layout.astro](src/layouts/Layout.astro) wraps everything — nav + mobile menu + footer + GSAP page-in. Posts additionally wrap in [PostLayout.astro](src/components/PostLayout.astro), which applies `prose prose-invert prose-emerald` typography.

**GSAP animations**: registered with `ScrollTrigger`. First-visit intro is gated by `sessionStorage.hasVisited` in [Layout.astro](src/layouts/Layout.astro) — subsequent navigations skip body fade-in and navbar stagger. Page-level animations (hero stagger, section reveals, project/blog card reveals, stack list stagger) live in the inline `<script>` of [src/pages/index.astro](src/pages/index.astro), keyed off classes `.hero-text`, `.gsap-section`, `.stagger-list`, `.project-card`, `.blog-card`. All ScrollTrigger reveal animations use `once: true` — elements stay visible after triggering, never reverse on scroll-up.

**Styling**: Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Theme tokens declared inline in CSS via `@theme` in [src/styles/global.css](src/styles/global.css). Fonts (`Inter`, `JetBrains Mono`) loaded from Google Fonts in [Layout.astro](src/layouts/Layout.astro). Typography plugin enabled via `@plugin "@tailwindcss/typography"`. Dark aesthetic hardcoded: black bg, emerald-500 accent, neutral grays. Canonical v4 class names (`bg-linear-to-b`, not `bg-gradient-to-b`) — `prettier-plugin-tailwindcss` sorts.

**No client framework**: zero React/Vue/Svelte despite `tsconfig` setting `jsx: react-jsx`. Everything is `.astro` components plus vanilla JS in inline scripts.

## Tooling

**ESLint flat config** ([eslint.config.js](eslint.config.js)): `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended. `*.config.{js,mjs,ts}` and root `*.{js,mjs}` get `globals.node` so `process.env` passes `no-undef`.

**Prettier** ([.prettierrc.json](.prettierrc.json)): `semi`, `singleQuote`, `trailingComma: es5`, `printWidth: 100`, plugins `prettier-plugin-astro` + `prettier-plugin-tailwindcss`. VS Code per-language `defaultFormatter` pinned in [.vscode/settings.json](.vscode/settings.json) to avoid the "multiple formatters" prompt.

**Lefthook** ([lefthook.yml](lefthook.yml)): `pre-commit` runs Prettier + ESLint in parallel on staged files (`stage_fixed: true` re-adds fixes). `pre-push` runs `bun run typecheck`. Install is idempotent via the `prepare` script; bypass with `LEFTHOOK=0` per command if needed.

## Conventions

- Mobile menu state, burger animation, and first-visit fade live entirely in one inline `<script>` in [Layout.astro](src/layouts/Layout.astro) — bundled by Astro, not loaded separately.
- Adding a blog post: create `src/content/blog/<slug>/index.md` with frontmatter `{ title, pubDate, description }`. Slug is the folder name (via `post.id`). Static paths regenerate on build. Code blocks are highlighted via Shiki (`github-dark` theme) with `@shikijs/transformers` — available notation: `// [!code ++]`/`// [!code --]` (diff), `// [!code highlight]` (highlight line), `// [!code focus]` (blur others). Each block gets a language label and hover-reveal copy button automatically.
- Project entries support either a single `link` or a multi `links` array — index page branches on whichever is set ([src/pages/index.astro](src/pages/index.astro)).
- License split: code is MIT, blog content under `src/content/` is © reserved ([README.md](README.md)).
