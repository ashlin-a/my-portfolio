
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

interface HomeConfig {
  hero: {
    label: string;
    headline: string;
    description: string;
    primaryBtn: Link;
    secondaryBtn: Link;
  };
  profile: {
    heading: string;
    content: string[];
    stats?: { value: string; label: string }[];
  };
  stack: {
    title: string;
    items: string[];
  }[];
  projects: Project[];
}

export const homeConfig: HomeConfig = {
  hero: {
    label: "// Hello, I'm Ashlin",
    headline: `Glad you're here.<br>Have a look<br>around`,
    description: "This is where I document my experiments and projects. I love open-source tools, clean systems, and seeing how things work under the hood.",
    primaryBtn: {
      text: "View Projects",
      href: "#projects",
    },
    secondaryBtn: {
      text: "Contact Me",
      href: "#contact",
    },
  },
  profile: {
    heading: "How I work.",
    content: [
    "I believe the best way to learn is by doing, which is why I don’t stop at localhost. I’m a graduate who loves the entire stack - from designing responsive UIs in React to managing the Linux servers that host them.",
    "My home lab is my testing ground. It’s where I experiment with Docker, configure reverse proxies, and learn the hard lessons about deployment and uptime. I’m ready to bring that full-lifecycle understanding to a professional team."
    ],
    // stats: [
    //   { value: "6+", label: "Years Exp" },
    //   { value: "50+", label: "Projects" },
    //   { value: "100%", label: "Uptime" },
    // ],
  },
 stack: [
    {
      title: "Languages",
      items: [
        "JavaScript / TypeScript",
        "Python",
        "Java",
        "C Lang",
      ],
    },
    {
      title: "Frontend",
      items: [
        "React / Next.js",
        "Astro",
        "Hugo",
        "HTML / CSS",
        "Tailwind / Bootstrap",
      ],
    },
    {
      title: "Backend",
      items: [
        "Node.js (Express / Hono)",
        "Flask",
        "PostgreSQL / MySQL",
        "MongoDB / Mongoose",
        "Prisma ORM",
        "WebRTC",
      ],
    },
    {
      title: "DevOps_Cloud",
      items: [
        "Docker / Kubernetes",
        "Cloudflare (Workers / Pages)",
        "Linux / Bash",
        "CI/CD Pipelines",
      ],
    },
    {
      title: "Testing_QA",
      items: [
        "Vitest / Jest",
        "Cypress",
        "Playwright", // Optional: If you use it, otherwise remove
      ],
    },
  ],

  projects: [
    {
      title: "TSCF Records App",
      link: { text: "View Code", href: "https://github.com/ashlin-a/TSCF-Sign-In-App" },
      description: "I made an app for The Second Chance Foundation, Non Profit Organization. Aim of the project was to digitize the manual form filling process for their clients.",
      tags: ["[ React ]", "[ TailwindCSS ]", "[ Express ]", "[ MongoDB ]", "[ Docker ]"]
    },
    {
      title: "Hugo Portfolio",
      links: [
        { text: "Live", href: "https://ashley-abraham.com" },
        // { text: "Code", href: "#" },
      ],
      description: "Made this content driven static portfolio website for Ashley Abraham, who is working as a Graphic Designer.",
      tags: ["[ Hugo ]", "[ TailwindCSS ]", "[ CI/CD ]", "[ Cloudflare Workers ]"],
    },
    {
      title: "Personal Portfolio",
      link: { text: "View Code", href: "https://github.com/ashlin-a/portfolio" },
      description: "My Old Portfolio Website with Server Side Rendering",
      tags: ["[ Next.js ]", "[ TailwindCSS ]", "[ Resend ]", "[ Cloudflare Workers ]"],
    },
  ],
};
 