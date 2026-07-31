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

**Central config funnel**: [src/config/index.ts](src/config/index.ts) re-exports `siteConfig` composed of [site.ts](src/config/site.ts), [navigation.ts](src/config/navigation.ts), [home.ts](src/config/home.ts). All page content (hero, stack, projects, writing, contact, social links) is data-driven from here — edit config, not JSX. `homeConfig` is typed via a local `HomeConfig` interface in [home.ts](src/config/home.ts).

Two shape rules worth knowing before editing it. **Every section object owns its `heading`**, so no page hardcodes copy — which is why `stack` and `projects` are wrappers (`stack.groups`, `projects.items`) rather than bare arrays, and why `writing` exists as a config block even though its posts come from the content collection. Sections carry no numerals — the only numerals in the markup are the per-project indices, derived from the order of `projects.items` rather than stored as content. And **`hero.headline` is a `string[]`**, one entry per rendered line: the page maps it to `<span class="block">`s, so line breaks stay a layout concern and no config value is ever passed through `set:html`.

**Content collections (Astro 6 Loader API)**: blog posts live in [src/content/blog/](src/content/blog/) as folders containing `index.md` plus co-located images. Schema in [src/content.config.ts](src/content.config.ts) (note: root `src/content.config.ts`, not `src/content/config.ts`) — uses `loader: glob({ pattern: '**/index.md', base: './src/content/blog' })` and `z` imported from `astro/zod` (the `astro:content` re-export is deprecated). Rendered by dynamic route [src/pages/blog/[...slug].astro](src/pages/blog/%5B...slug%5D.astro) via `getStaticPaths` using `post.id` (was `post.slug` pre-v6) and `render(post)` imported from `astro:content` (was `post.render()` pre-v6). Home page surfaces the 3 most recent posts (sorted by `pubDate`).

**Layouts**: single [Layout.astro](src/layouts/Layout.astro) wraps everything — nav + popover mobile menu + footer. Posts additionally wrap in [PostLayout.astro](src/components/PostLayout.astro), which applies `prose prose-lg` typography (no color modifier — see Theming). [PostRow.astro](src/components/PostRow.astro) is the single writing-list row treatment, shared by the home page and the blog index so the two can't drift apart.

**Design language — editorial**: large serif display type, generous whitespace, hairline rules, and the project indices as the page's one numeric ornament. Page sections are full-bleed with a `border-t border-line` hairline; the inner `mx-auto max-w-6xl px-6 md:px-10 lg:px-16` container does the constraining (`<main>` itself is unstyled). There is no filled sidebar, no card chrome, no shadows, and no border radii outside code blocks.

**Every section has its own archetype** — this is load-bearing, and the thing to preserve when editing. An earlier pass gave every section the same "mono label in `md:col-span-3` on the left → content on the right" template, which is just the old terminal design's rail grid with the fill removed; it read as monotonous no matter how the colors changed. The current shapes ([index.astro](src/pages/index.astro)):

| section | archetype                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero    | Display headline spans the container; the lede is **offset** to `md:col-start-7`, not stacked under it. Closes with a hairline colophon band on the fold (job title / year, both derived). |
| Stack   | Colophon grid — `sm:grid-cols-2 lg:grid-cols-3` of hairline-topped blocks, `meta` group label over serif items. Five groups leaves a ragged final row; that is intended.                   |
| Work    | Two positions per entry — index numeral, title and description in `md:col-span-7`; tags and links hang in `md:col-start-10 md:col-span-3`.                                                 |
| Writing | Contents page — dates hang right (`md:col-start-10 … md:text-right`) via [PostRow.astro](src/components/PostRow.astro).                                                                    |
| Contact | Statement across the page at `text-headline`, then a split: description left, email + socials right.                                                                                       |

An About/Profile section used to sit between the hero and Stack — one text column with the numeral hanging in the right margin. It was cut (copy and all) because the copy was filler, and the section numerals went with it rather than leaving the page starting at `02`. Do not restore either without new copy worth reading. Its geometry rule outlived it: never route body copy into a column narrower than ~5 of 12, which is what made an earlier Work section a thin tall stack beside a short title.

Vertical rhythm is deliberately **not** uniform (`md:py-32` → `md:py-48` depending on section). If you add a section, give it a shape that isn't already in this table.

**Motion — CSS only, no animation library**. Everything animates from a **visible resting state**, so the page is complete without JS and without scroll-driven-animation support:

- `.enter` — load-time stagger, ordered by an inline `style="--i:N"` on each child (`animation-delay: calc(var(--i) * 90ms)`). Used by the hero, the blog header, 404, and the popover menu links.
- `.reveal` — scroll reveal via `animation-timeline: view()`, declared **inside** `@supports (animation-timeline: view())` **and** `@media (prefers-reduced-motion: no-preference)`. Keep it inside both guards: an unguarded `opacity: 0` resting state is what made the old GSAP build render blank when JS failed.
- A global `@media (prefers-reduced-motion: reduce)` block neutralizes animations, transitions, and `scroll-behavior`.

Do not reintroduce GSAP or any JS-driven reveal. The only JS on the site is the theme init/toggle, the code-block copy button, and a short script that closes the popover menu in the two cases the platform doesn't cover (see Conventions).

**Styling**: Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Theme tokens declared inline in CSS via `@theme` in [src/styles/global.css](src/styles/global.css). Fonts (`Instrument Serif`, `Inter`, `JetBrains Mono`) loaded from Google Fonts in [Layout.astro](src/layouts/Layout.astro). Typography plugin enabled via `@plugin "@tailwindcss/typography"`. Canonical v4 class names (`bg-linear-to-b`, not `bg-gradient-to-b`) — `prettier-plugin-tailwindcss` sorts.

**Type roles** — serif is display only (hero, section headings, project/post titles, the wordmark); Inter carries lede, body, buttons, and nav; JetBrains Mono is reserved for metadata (section labels, project indices, dates, tags, group labels, footer) and code.

**Every size on the site is a `@theme` token** — no arbitrary font sizes in markup. Each carries paired `--text-*--line-height` / `--text-*--letter-spacing`, which Tailwind emits as a utility of the same name:

| token             | utility         | used for                                                        |
| ----------------- | --------------- | --------------------------------------------------------------- |
| `--text-display`  | `text-display`  | hero + blog index + 404 numeral, `clamp(2.75rem, 12vw, 8.5rem)` |
| `--text-headline` | `text-headline` | section statements, post titles                                 |
| `--text-title`    | `text-title`    | project titles, writing rows, the contact email                 |
| `--text-lede`     | `text-lede`     | hero lede, post standfirst                                      |
| `--text-body`     | `text-body`     | all running body copy                                           |

The scale is intentionally wide at both ends — 11px meta against a 136px display is what makes it read as editorial rather than as a large-ish website. The `8.5rem` display cap is a content constraint, not taste: the longest hero line is ~18 characters, about what fits `max-w-6xl` minus gutters on one line.

Metadata lettering is the **`meta` utility** (a Tailwind v4 `@utility` in [global.css](src/styles/global.css)), not a repeated class string — it sets the mono family, 11px, `0.18em` tracking and uppercase, and deliberately omits color so it composes: `meta text-muted`, `meta text-line-strong`. Don't reintroduce `font-mono text-xs tracking-[0.14em] uppercase` inline.

**Theming (light + dark)**: a **semantic token palette** in `@theme` — `canvas`, `surface`/`surface-hover`, `line`/`line-strong`, `ink`/`ink-soft`/`muted`/`faint`, `accent`/`accent-hover`, `accent-fill`/`accent-fill-hover`/`on-accent`, `selection`, `code-bg`/`code-highlight`. **Light values are the `@theme` base**; `:root.dark` further down [global.css](src/styles/global.css) overrides every token, so a theme switch is one class flip on `<html>` — no per-element `dark:` duplication. Use plain `@theme`, never `@theme inline` (inlining bakes the values and breaks the runtime override), and keep the overrides on `:root.dark` so they outrank Tailwind's `:root` block on specificity, not just source order.

The palette is **warm neutrals + ink blue**: paper `#fbfaf7` / warm near-black `#0e0d0b`, never pure `#fff`/`#000`. Every text token clears WCAG AA (4.5:1) against `canvas` in both modes — `faint` is the floor at 4.5:1 light / 4.8:1 dark. `line` and `line-strong` are **rule colours, not text colours**: they sit around 2:1 and must only paint borders, separators and purely ornamental marks. Anything a reader is meant to read — including small labels like the per-project index numerals — takes `muted` or darker, so that numerals match the section labels above them rather than fading out. `accent` is `#1d3f8f` light (9.3:1) and `#9db8ff` dark (9.9:1); `accent-fill` diverges from `accent` in dark mode only (`#2e4fa8`) because a light-blue slab under dark text is too loud at button size.

`@custom-variant dark (&:where(.dark, .dark *))` now survives for exactly two reasons: the ThemeToggle's `dark:hidden` / `dark:block` icon swap, and the Shiki dual-theme rules. Prose no longer needs `dark:prose-invert` — the `--tw-prose-*` variables are mapped onto the palette tokens in [global.css](src/styles/global.css), so long-form content flips with everything else.

**Theme switching**: an `is:inline` script in the `<head>` of [Layout.astro](src/layouts/Layout.astro) sets `.dark` on `<html>` before first paint — it must stay inline and in `<head>`, since the page's other `<script>` is a module and runs too late to prevent a flash. Contract: `localStorage.theme` is `'dark'`/`'light'` when the user has chosen, and **absent means follow the OS** — [ThemeToggle.astro](src/components/ThemeToggle.astro) keeps a `matchMedia` listener so an unset preference tracks the OS live rather than sampling it once. The single `<meta name="theme-color">` is updated by JS (not `media`-scoped) so it follows the override too; its two hexes must stay in sync with `canvas` in both [Layout.astro](src/layouts/Layout.astro) and [ThemeToggle.astro](src/components/ThemeToggle.astro).

**No client framework**: zero React/Vue/Svelte despite `tsconfig` setting `jsx: react-jsx`. Everything is `.astro` components plus vanilla JS in inline scripts.

## Tooling

**ESLint flat config** ([eslint.config.js](eslint.config.js)): `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended. `*.config.{js,mjs,ts}` and root `*.{js,mjs}` get `globals.node` so `process.env` passes `no-undef`.

**Prettier** ([.prettierrc.json](.prettierrc.json)): `semi`, `singleQuote`, `trailingComma: es5`, `printWidth: 100`, plugins `prettier-plugin-astro` + `prettier-plugin-tailwindcss`. VS Code per-language `defaultFormatter` pinned in [.vscode/settings.json](.vscode/settings.json) to avoid the "multiple formatters" prompt.

**Lefthook** ([lefthook.yml](lefthook.yml)): `pre-commit` runs Prettier + ESLint in parallel on staged files (`stage_fixed: true` re-adds fixes). `pre-push` runs `bun run typecheck`. Install is idempotent via the `prepare` script; bypass with `LEFTHOOK=0` per command if needed.

## Conventions

- **Never write raw color utilities** (`bg-black`, `text-neutral-400`, `text-emerald-500`, …) in markup — use the semantic tokens (`bg-canvas`, `text-ink-soft`, `text-accent`, …) so new UI themes automatically. `grep -rE '(bg|text|border)-(neutral|emerald|black|white)' --include='*.astro' src/` must return **nothing** — there are no longer any legitimate exceptions.
- The **mobile menu is a native popover**, not a JS-driven overlay. `<button popovertarget="mobile-menu">` gets open/close, Escape, light-dismiss, and implicit `aria-expanded` from the platform. Everything visual lives in [global.css](src/styles/global.css): entry/exit use `@starting-style` + `transition-behavior: allow-discrete`, scroll is locked via `html:has(#mobile-menu:popover-open)`, and the burger→X morph is `:root:has(#mobile-menu:popover-open) #line-1/#line-2`. **The overlay is `inset: 3.5rem 0 0 0`, not `inset: 0`** — a popover renders in the top layer, which paints above every `z-index`, so a full-bleed overlay covers the fixed `h-14` nav and buries the toggle that closes it. Keep it below the nav, and keep the explicit `width`/`height` (the inset does the sizing, so the UA's `fit-content` has to be overridden, and the definite height is what lets the list's `h-full` centring resolve). Because classes (not inline styles) own the burger color, switching theme while the menu is open can't strand a stale value — don't reintroduce JS that writes inline styles here. Two things the platform doesn't do — dismiss on same-page anchor clicks, and close when the viewport crosses to the desktop breakpoint (a phone rotated to landscape hides the burger) — are what the small `<script>` at the bottom of [Layout.astro](src/layouts/Layout.astro) handles. It guards both with `:popover-open`, since `hidePopover()` throws on a popover that isn't showing.
- Adding a blog post: create `src/content/blog/<slug>/index.md` with frontmatter `{ title, pubDate, description }`. Slug is the folder name (via `post.id`). Static paths regenerate on build. Code blocks are highlighted via Shiki (dual `github-light`/`github-dark` with `defaultColor: false`, which emits `--shiki-light`/`--shiki-dark` custom properties per token that [global.css](src/styles/global.css) swaps; the `pre` background stays `--color-code-bg` so the custom accent-bordered block survives both modes — do not reintroduce `!important` on `.prose pre`, it defeats the dual theme) with `@shikijs/transformers` — available notation: `// [!code ++]`/`// [!code --]` (diff), `// [!code highlight]` (highlight line), `// [!code focus]` (blur others). Each block gets a language label and hover-reveal copy button automatically.
- Project entries support either a single `link` or a multi `links` array; the index page normalizes them with `project.links ?? (project.link ? [project.link] : [])` rather than branching the markup ([src/pages/index.astro](src/pages/index.astro)).
- Dates are formatted with an explicit `toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })` — never bare `toLocaleDateString()`, which makes the static output depend on the build machine's locale.
- License split: code is MIT, blog content under `src/content/` is © reserved ([README.md](README.md)).
