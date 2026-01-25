
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
    stats: { value: string; label: string }[];
  };
  stack: {
    title: string;
    items: string[];
  }[];
  projects: Project[];
}

export const homeConfig: HomeConfig = {
  hero: {
    label: "// Full-Stack Engineer",
    headline: `Robust systems.<br>Clean architecture.<br>Zero bloat`,
    description: "I build accessible, high-performance web applications. Focused on scalability, type safety, and efficient user interfaces without the visual noise.",
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
    heading: "Engineering over hype.",
    content: [
      "I approach web development with a pragmatic mindset. While I appreciate modern trends, I prioritize stability, maintainability, and core web vitals.",
      "With 6+ years of experience in the field, I have moved from tweaking CSS to architecting distributed systems. I believe that good code is boring code—it works predictably, handles errors gracefully, and is easy for the next developer to read.",
    ],
    stats: [
      { value: "6+", label: "Years Exp" },
      { value: "50+", label: "Projects" },
      { value: "100%", label: "Uptime" },
    ],
  },
  stack: [
    {
      title: "Frontend_Core",
      items: [
        "React / Next.js",
        "TypeScript",
        "Tailwind CSS",
        "HTML5 / Semantic",
        "HTML5 / Semantic",
        "HTML5 / Semantic",
      ],
    },
    {
      title: "Backend_Sys",
      items: [
        "Node.js",
        "PostgreSQL",
        "Redis",
        "Go (Golang)",
      ],
    },
    {
      title: "DevOps_Tools",
      items: [
        "Docker",
        "AWS / Vercel",
        "CI/CD Pipelines",
        "Linux / Bash",
      ],
    },
  ],
  projects: [
    {
      title: "Inventory Logistics API",
      link: { text: "View Code", href: "#" },
      description: "A high-throughput inventory management system designed for warehousing. Features real-time tracking, automated reordering, and role-based access control.",
      tags: ["[ Node.js ]", "[ PostgreSQL ]", "[ Redis ]", "[ Docker ]"],
    },
    {
      title: "Minimalist Finance Dashboard",
      links: [
        { text: "Demo", href: "#" },
        { text: "Code", href: "#" },
      ],
      description: "A client-side data visualization tool for tracking cryptocurrency assets. Focuses on performance, localized number formatting, and dark mode aesthetics.",
      tags: ["[ React ]", "[ D3.js ]", "[ Tailwind ]", "[ WebSocket ]"],
    },
    {
      title: "CLI Tool for Documentation",
      link: { text: "View Code", href: "#" },
      description: "An open-source command-line interface that generates static documentation sites from Markdown files. Zero config required.",
      tags: ["[ Rust ]", "[ Clap ]", "[ Markdown ]"],
    },
  ],
};
