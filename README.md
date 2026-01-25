# Dev Portfolio_

A high-performance, minimalist portfolio website for a Senior Full-Stack Engineer. Built with a focus on clean architecture, type safety, and zero bloat. This project uses a modern tech stack to deliver a fast, accessible, and visually engaging experience.

## ⚡️ Tech Stack

This project leverages the following technologies:

- **Core Framework:** [Astro](https://astro.build/) (v5) - For zero-JS-by-default performance and content collections.
- **UI Library:** [React](https://react.dev/) - Used for interactive islands and complex components.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) - Utility-first styling with a custom dark theme config.
- **Runtime & Package Manager:** [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime.
- **Animations:** [GSAP](https://gsap.com/) - High-performance animations (ScrollTrigger, staggered reveals).
- **Type Safety:** [TypeScript](https://www.typescriptlang.org/) - Strict type checking across the entire codebase.
- **Containerization:** [Docker](https://www.docker.com/) - Multi-stage builds for development and production (Nginx).

## ✨ Features

- **Minimalist Dark Theme:** Custom "Inter" and "JetBrains Mono" typography with a terminal-inspired aesthetic.
- **High Performance:** Static Site Generation (SSG) with Astro for optimal loading speeds.
- **Interactive Animations:**
    - Smooth page fade-ins.
    - Staggered hero text reveals.
    - Scroll-triggered section reveals.
    - Staggered list items and cards.
- **Content Management:** Markdown-based blog using Astro Content Collections with `@tailwindcss/typography` styling.
- **Responsive Design:** Fully fluid layout that adapts to mobile, tablet, and desktop screens.
- **Configurable:** Centralized configuration (`src/config/`) for site metadata and navigation.

## 🛠️ Getting Started

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

## 📦 Production

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

## 📂 Project Structure

```text
/
├── .dockerignore          # Docker exclusion list
├── Dockerfile             # Multi-stage Docker build definition
├── docker-compose.yml     # Dev container config
├── docker-compose.prod.yml# Prod container config
├── package.json           # Project dependencies
├── src/
│   ├── components/        # React & Astro components
│   ├── config/            # Centralized site config (Site Info, Nav)
│   ├── content/           # Blog posts (Markdown)
│   ├── layouts/           # Page layouts (Layout.astro)
│   ├── pages/             # Route definitions (index.astro, blog/, posts/)
│   └── styles/            # Global CSS & Tailwind config
└── tsconfig.json          # TypeScript configuration
```

## 📄 License

MIT