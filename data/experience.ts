export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  bullets: string[];
  stack: string[];
}

export const experiences: ExperienceEntry[] = [
  {
    company: "Acme Technologies",
    role: "Full Stack Developer",
    period: "Jan 2023 – Present",
    bullets: [
      "Architected a microservices platform serving 500K+ daily active users",
      "Led migration from REST to GraphQL, reducing payload sizes by 40%",
      "Built real-time dashboards using WebSockets and React Query",
      "Deployed CI/CD pipelines on GitHub Actions, cutting deploy times by 60%",
      "Mentored 3 junior developers through code review and pair programming",
    ],
    stack: ["React", "Node.js", "GraphQL", "PostgreSQL", "AWS", "Docker"],
  },
  {
    company: "Nova Digital Agency",
    role: "Frontend Developer",
    period: "Jun 2021 – Dec 2022",
    bullets: [
      "Developed responsive web applications for 10+ enterprise clients",
      "Improved Lighthouse performance scores from 60 to 95+ across all projects",
      "Integrated third-party APIs including Stripe, Twilio, and Google Maps",
      "Built a reusable component library adopted across 5 internal projects",
      "Collaborated with UX designers to implement pixel-perfect interfaces",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe", "Firebase"],
  },
  {
    company: "ByteForge Solutions",
    role: "Junior Developer",
    period: "Jan 2020 – May 2021",
    bullets: [
      "Built and maintained RESTful APIs consumed by mobile and web clients",
      "Wrote unit and integration tests achieving 85% code coverage",
      "Optimized slow database queries, reducing API response times by 35%",
      "Participated in agile ceremonies and contributed to sprint planning",
      "Refactored legacy jQuery codebase to a modern React SPA",
    ],
    stack: ["React", "Express.js", "MongoDB", "Jest", "MySQL"],
  },
];
