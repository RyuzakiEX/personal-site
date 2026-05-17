export interface ProjectEntry {
  title: string;
  description: string;
  stack: string[];
  url: string;
}

export const projects: ProjectEntry[] = [
  {
    title: "NeuralDash",
    description:
      "Real-time analytics dashboard with AI-driven insights, customizable widget grid, and live data streaming.",
    stack: ["Next.js", "TypeScript", "D3.js", "OpenAI API", "WebSockets"],
    url: "https://github.com/jorgeadanza",
  },
  {
    title: "ShopFlow",
    description:
      "Full-stack e-commerce platform with inventory management, Stripe payments, and an admin dashboard.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis"],
    url: "https://github.com/jorgeadanza",
  },
  {
    title: "TaskSync",
    description:
      "Collaborative project management tool with real-time updates, drag-and-drop boards, and team chat.",
    stack: ["Next.js", "Socket.io", "Prisma", "MySQL", "Tailwind CSS"],
    url: "https://github.com/jorgeadanza",
  },
  {
    title: "DevLink",
    description:
      "Developer networking platform where engineers share projects, find collaborators, and post job listings.",
    stack: ["React", "GraphQL", "MongoDB", "AWS S3", "JWT"],
    url: "https://github.com/jorgeadanza",
  },
];
