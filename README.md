# Portfolio\_

A high-performance, editorial portfolio website for a full-stack engineer — large serif display type, generous whitespace, an asymmetric grid, and hairline rules on a warm paper/ink palette. Built with a focus on clean architecture, type safety, and zero bloat.

## Tech Stack

This project leverages the following technologies:

- **Core Framework:** [Astro](https://astro.build/) (v6) - For zero-JS-by-default performance and content collections.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) - Utility-first styling on a semantic token palette that drives both light and dark themes.
- **Runtime & Package Manager:** [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime.
- **Animations:** Native CSS only - scroll-driven `animation-timeline: view()` reveals and keyframe staggers, no animation library.
- **Type Safety:** [TypeScript](https://www.typescriptlang.org/) - Strict type checking across the entire codebase.
- **Containerization:** [Docker](https://www.docker.com/) - Multi-stage builds for development and production (Nginx).

## Features

- **Editorial Typography:** "Instrument Serif" for display, "Inter" for body, "JetBrains Mono" for metadata and code, on fluid `clamp()` display sizes declared as theme tokens.
- **Light & Dark Themes:** A warm paper/ink-blue semantic token palette where every text color clears WCAG AA in both modes. Follows the OS preference by default; a navbar toggle overrides it, persisted in `localStorage` and applied before first paint so there is no flash.
- **High Performance:** Static Site Generation (SSG) with Astro for optimal loading speeds.
- **Animations without JavaScript:**
  - Scroll reveals via CSS scroll-driven animations, feature-detected so unsupported browsers simply show the content.
  - Keyframe entry staggers on the hero and page headers.
  - A mobile menu built on the native Popover API — Escape, light-dismiss and `aria-expanded` come from the platform.
  - Full `prefers-reduced-motion` support.
- **Content Management:** Markdown-based blog using Astro Content Collections with `@tailwindcss/typography` styling.
- **Responsive Design:** Fully fluid layout that adapts to mobile, tablet, and desktop screens.
- **Configurable:** Centralized configuration (`src/config/`) for site metadata and navigation.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) (Optional, for containerized workflow)

### Local Development

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/my-portfolio.git
    cd my-portfolio
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Start the development server:**
    ```bash
    bun run dev
    ```
    Access the site at `http://localhost:4321`.

### Docker Development

Run the project in a container with Hot Module Replacement (HMR) enabled:

```bash
docker compose up --build
```

Access at `http://localhost:4321`.

## Production

### Build Locally

To build the static site to the `./dist` directory:

```bash
bun run build
```

### Docker Production Build

Build and serve the optimized static site using Nginx:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Access at `http://localhost:8080`.

## Project Structure

```text
/
├── .dockerignore          # Docker exclusion list
├── Dockerfile             # Multi-stage Docker build definition
├── docker-compose.yml     # Dev container config
├── docker-compose.prod.yml# Prod container config
├── package.json           # Project dependencies
├── src/
│   ├── components/        # UI components (Astro)
│   ├── config/            # Centralized site config (Site Info, Nav)
│   ├── content/           # Blog posts (Markdown)
│   ├── layouts/           # Page layouts (Layout.astro)
│   ├── pages/             # Route definitions (index.astro, blog/, posts/)
│   └── styles/            # Global CSS & Tailwind config
└── tsconfig.json          # TypeScript configuration
```

## License

- **Code** (components, layouts, pages, config): [MIT](LICENSE)
- **Blog content** (`/src/content/`): © 2026 ashlin-a — [All Rights Reserved](LICENSE)
