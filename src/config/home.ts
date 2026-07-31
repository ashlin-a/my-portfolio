interface Link {
  text: string;
  href: string;
}

interface Project {
  title: string;
  link?: Link;
  links?: Link[];
  description: string;
  tags: string[];
}

/**
 * Every section carries its own `heading`, so no page ever hardcodes one and
 * the wording stays editable here. The page carries no section numerals; the
 * only numerals in the markup are the per-project indices, derived from the
 * order of `projects.items`.
 */
interface HomeConfig {
  hero: {
    label: string;
    /** One entry per rendered line — keeps line breaks out of the markup. */
    headline: string[];
    description: string;
    primaryBtn: Link;
    secondaryBtn: Link;
  };
  stack: {
    heading: string;
    groups: {
      title: string;
      items: string[];
    }[];
  };
  projects: {
    heading: string;
    items: Project[];
  };
  writing: {
    heading: string;
  };
  contact: {
    label: string;
    heading: string;
    description: string;
  };
}

export const homeConfig: HomeConfig = {
  hero: {
    label: "Hello, I'm Ashlin",
    headline: ["Glad you're here.", 'Have a look around'],
    description: "Little corner of the web where I keep track of what I make and what I'm into.",
    primaryBtn: {
      text: 'View projects',
      href: '#projects',
    },
    secondaryBtn: {
      text: 'Get in touch',
      href: '#contact',
    },
  },
  stack: {
    heading: 'What I build with.',
    groups: [
      {
        title: 'Languages',
        items: ['JavaScript / TypeScript', 'Python', 'Java', 'C Lang'],
      },
      {
        title: 'Frontend',
        items: ['React / Next.js', 'Astro', 'Hugo', 'HTML / CSS', 'Tailwind / Bootstrap'],
      },
      {
        title: 'Backend',
        items: [
          'Node.js (Express / Hono)',
          'Flask',
          'PostgreSQL / MySQL',
          'MongoDB / Mongoose',
          'Prisma ORM',
          'WebRTC',
        ],
      },
      {
        title: 'DevOps & Cloud',
        items: [
          'Docker / Kubernetes',
          'Cloudflare (Workers / Pages)',
          'Linux / Bash',
          'CI/CD Pipelines',
        ],
      },
      {
        title: 'Testing & QA',
        items: ['Vitest / Jest', 'Cypress', 'Playwright'],
      },
    ],
  },

  projects: {
    heading: 'Selected work.',
    items: [
      {
        title: 'ByteBay',
        link: { text: 'View code', href: 'https://github.com/ashlin-a/byte-bay' },
        description:
          'Full-stack cloud storage app (Google Drive-style). Upload, organize, and share files via a React SPA backed by a REST API. Files stored in S3-compatible object storage via presigned URLs — API never proxies bytes. Includes folder trees, shared links with expiry and download limits, and a full audit event log.',
        tags: [
          'React',
          'TypeScript',
          'Express',
          'PostgreSQL',
          'Drizzle ORM',
          'Better Auth',
          'AWS S3',
          'Docker',
          'Turborepo',
          'TailwindCSS',
        ],
      },
      {
        title: 'TSCF Records App',
        link: { text: 'View code', href: 'https://github.com/ashlin-a/TSCF-Sign-In-App' },
        description:
          'I made an app for The Second Chance Foundation, Non Profit Organization. Aim of the project was to digitize the manual form filling process for their clients.',
        tags: ['React', 'TailwindCSS', 'Express', 'MongoDB', 'Docker'],
      },
      {
        title: 'Hugo Portfolio',
        links: [
          { text: 'Live', href: 'https://ashley-abraham.com' },
          // { text: "Code", href: "#" },
        ],
        description:
          'Made this content driven static portfolio website for Ashley Abraham, who is working as a Graphic Designer.',
        tags: ['Hugo', 'TailwindCSS', 'CI/CD', 'Cloudflare Workers'],
      },
      {
        title: 'Personal Portfolio',
        link: { text: 'View code', href: 'https://github.com/ashlin-a/portfolio' },
        description: 'My Old Portfolio Website with Server Side Rendering',
        tags: ['Next.js', 'TailwindCSS', 'Resend', 'Cloudflare Workers'],
      },
    ],
  },

  writing: {
    heading: 'Thinking out loud',
  },

  contact: {
    label: 'Contact',
    heading: 'Ready to collaborate?',
    description:
      'Currently open for freelance contracts and full-time opportunities. If you need clean code and solid architecture, let’s talk.',
  },
};
