# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, Aider, etc.) working in this repository. `CLAUDE.md` is a symlink to this file for Claude Code auto-loading.

## Commands

- `bun install` — install deps (Docker uses `--frozen-lockfile`). `prepare` script runs `lefthook install` when `.git` exists, no-ops otherwise (so containers don't fail).
- `bun run dev` — Astro dev server on port 4321
- `bun run build` — static build to `./dist`
- `bun run preview` — preview built site
- `bun run deploy` — `astro build && wrangler deploy` ships `dist/` as a Cloudflare static-assets Worker
- `bun run lint` / `bun run lint:fix` — ESLint flat config
- `bun run format` / `bun run format:check` — Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`)
- `bun run typecheck` — `astro check` (also runs in `pre-push`)
- `docker compose up --build` — dev container with HMR via bind mount (port 4321)
- `docker compose -f docker-compose.prod.yml up --build` — Nginx-served prod build (port 8080)

## Architecture

**Astro 6 SSG, no adapter** ([astro.config.mjs](astro.config.mjs)). Pure static build to `dist/` — no worker, no SSR. Two deploy paths share the same output:

- Cloudflare static-assets Worker via `bun run deploy` — [wrangler.jsonc](wrangler.jsonc) hand-authored with `assets.directory: ./dist` and no `main`. `wrangler deploy` uploads `dist/` as static assets.
- Static Nginx via `docker-compose.prod.yml` — serves `dist/` directly.

The `@astrojs/cloudflare` adapter was removed: it forces a _runtime_ image service (markdown images become `/_image?href=…` URLs), but a static site emits no worker to serve `/_image`, so images 404 everywhere. The adapter also auto-injected `SESSION` KV and `IMAGES` bindings that needed workarounds. With no adapter, Astro's default **sharp** image service optimizes images at build into `/_astro/*.webp` referenced by direct URL — works identically in `wrangler dev`, `bun run preview`, prod, and the Nginx path. Do not re-add the adapter unless the site needs SSR/edge functions.

**Path alias**: `@/*` → `src/*` ([tsconfig.json](tsconfig.json), `paths` only — no `baseUrl`, TS 5+ resolves relative to tsconfig). Use `@/config` etc., not relative imports across `src/`.

**Central config funnel**: [src/config/index.ts](src/config/index.ts) re-exports `siteConfig` composed of [site.ts](src/config/site.ts), [navigation.ts](src/config/navigation.ts), [home.ts](src/config/home.ts). All page content (hero, profile, stack, projects, social links) is data-driven from here — edit config, not JSX. `homeConfig` is typed via a local `HomeConfig` interface in [home.ts](src/config/home.ts).

**Content collections (Astro 6 Loader API)**: blog posts live in [src/content/blog/](src/content/blog/) as folders containing `index.md` plus co-located images. Schema in [src/content.config.ts](src/content.config.ts) (note: root `src/content.config.ts`, not `src/content/config.ts`) — uses `loader: glob({ pattern: '**/index.md', base: './src/content/blog' })` and `z` imported from `astro/zod` (the `astro:content` re-export is deprecated). Rendered by dynamic route [src/pages/blog/[...slug].astro](src/pages/blog/%5B...slug%5D.astro) via `getStaticPaths` using `post.id` (was `post.slug` pre-v6) and `render(post)` imported from `astro:content` (was `post.render()` pre-v6). Home page surfaces the 3 most recent posts (sorted by `pubDate`).

**Layouts**: single [Layout.astro](src/layouts/Layout.astro) wraps everything — nav + mobile menu + footer + GSAP page-in. Posts additionally wrap in [PostLayout.astro](src/components/PostLayout.astro), which applies `prose prose-invert prose-emerald` typography.

**GSAP animations**: registered with `ScrollTrigger`. First-visit intro is gated by `sessionStorage.hasVisited` in [Layout.astro](src/layouts/Layout.astro) — subsequent navigations skip body fade-in and navbar stagger. Page-level animations (hero stagger, section reveals, project/blog card reveals, stack list stagger) live in the inline `<script>` of [src/pages/index.astro](src/pages/index.astro), keyed off classes `.hero-text`, `.gsap-section`, `.stagger-list`, `.project-card`, `.blog-card`. All ScrollTrigger reveal animations use `once: true` — elements stay visible after triggering, never reverse on scroll-up.

**Styling**: Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Theme tokens declared inline in CSS via `@theme` in [src/styles/global.css](src/styles/global.css). Fonts (`Inter`, `JetBrains Mono`) loaded from Google Fonts in [Layout.astro](src/layouts/Layout.astro). Typography plugin enabled via `@plugin "@tailwindcss/typography"`. Canonical v4 class names (`bg-linear-to-b`, not `bg-gradient-to-b`) — `prettier-plugin-tailwindcss` sorts.

**Theming (light + dark)**: a **semantic token palette** in `@theme` — `canvas`, `surface`/`surface-hover`, `line`/`line-strong`, `ink`/`ink-soft`/`muted`/`faint`, `accent`/`accent-hover`, `accent-fill`/`accent-fill-hover`/`on-accent`, `selection`, `code-bg`/`code-highlight`. **Light values are the `@theme` base**; `:root.dark` further down [global.css](src/styles/global.css) overrides every token, so a theme switch is one class flip on `<html>` — no per-element `dark:` duplication. Use plain `@theme`, never `@theme inline` (inlining bakes the values and breaks the runtime override), and keep the overrides on `:root.dark` so they outrank Tailwind's `:root` block on specificity, not just source order.

Dark mode is byte-for-byte the previous design (`surface` `#050505`/`#080808` are the opaque equivalents of the old `bg-neutral-900/20` and `/30` over black). In light mode `accent` is emerald-**700** (`#047857`, 5.5:1 on white) — emerald-600 fails AA for body text; `accent-fill` stays emerald-600 because it is only ever a background under `on-accent` text.

`@custom-variant dark (&:where(.dark, .dark *))` is declared for the four cases a token swap can't express: the 404 gradient numeral (stops reverse direction), `dark:prose-invert`, `dark:bg-accent/5`, and the Shiki dual-theme rules.

**Theme switching**: an `is:inline` script in the `<head>` of [Layout.astro](src/layouts/Layout.astro) sets `.dark` on `<html>` before first paint — it must stay inline and in `<head>`, since the page's other `<script>` is a module and runs too late to prevent a flash. Contract: `localStorage.theme` is `'dark'`/`'light'` when the user has chosen, and **absent means follow the OS** — [ThemeToggle.astro](src/components/ThemeToggle.astro) keeps a `matchMedia` listener so an unset preference tracks the OS live rather than sampling it once. The single `<meta name="theme-color">` is updated by JS (not `media`-scoped) so it follows the override too. GSAP writes inline styles that beat classes, so the burger tween reads `--color-ink`/`--color-accent` via `getComputedStyle` at animation time and `clearProps`es on close.

**No client framework**: zero React/Vue/Svelte despite `tsconfig` setting `jsx: react-jsx`. Everything is `.astro` components plus vanilla JS in inline scripts.

## Tooling

**ESLint flat config** ([eslint.config.js](eslint.config.js)): `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended. `*.config.{js,mjs,ts}` and root `*.{js,mjs}` get `globals.node` so `process.env` passes `no-undef`.

**Prettier** ([.prettierrc.json](.prettierrc.json)): `semi`, `singleQuote`, `trailingComma: es5`, `printWidth: 100`, plugins `prettier-plugin-astro` + `prettier-plugin-tailwindcss`. VS Code per-language `defaultFormatter` pinned in [.vscode/settings.json](.vscode/settings.json) to avoid the "multiple formatters" prompt.

**Lefthook** ([lefthook.yml](lefthook.yml)): `pre-commit` runs Prettier + ESLint in parallel on staged files (`stage_fixed: true` re-adds fixes). `pre-push` runs `bun run typecheck`. Install is idempotent via the `prepare` script; bypass with `LEFTHOOK=0` per command if needed.

## Conventions

- **Never write raw color utilities** (`bg-black`, `text-neutral-400`, `text-emerald-500`, …) in markup — use the semantic tokens (`bg-canvas`, `text-ink-soft`, `text-accent`, …) so new UI themes automatically. `grep -rE '(bg|text|border)-(neutral|emerald|black|white)' --include='*.astro' src/` should only ever surface the 404 gradient.
- Mobile menu state, burger animation, and first-visit fade live entirely in one inline `<script>` in [Layout.astro](src/layouts/Layout.astro) — bundled by Astro, not loaded separately. The nav's right-hand cluster wraps the desktop `<ul>`, the theme toggle, and the burger in one flex group; keep the `<ul>` itself intact, since the intro stagger selects `nav ul.hidden li`.
- Adding a blog post: create `src/content/blog/<slug>/index.md` with frontmatter `{ title, pubDate, description }`. Slug is the folder name (via `post.id`). Static paths regenerate on build. Code blocks are highlighted via Shiki (dual `github-light`/`github-dark` with `defaultColor: false`, which emits `--shiki-light`/`--shiki-dark` custom properties per token that [global.css](src/styles/global.css) swaps; the `pre` background stays `--color-code-bg` so the custom emerald-bordered block survives both modes — do not reintroduce `!important` on `.prose pre`, it defeats the dual theme) with `@shikijs/transformers` — available notation: `// [!code ++]`/`// [!code --]` (diff), `// [!code highlight]` (highlight line), `// [!code focus]` (blur others). Each block gets a language label and hover-reveal copy button automatically.
- Project entries support either a single `link` or a multi `links` array — index page branches on whichever is set ([src/pages/index.astro](src/pages/index.astro)).
- License split: code is MIT, blog content under `src/content/` is © reserved ([README.md](README.md)).
