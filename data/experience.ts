export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  type: string;
  bullets: string[];
  stack: string[];
}

export const experiences: ExperienceEntry[] = [
  {
    company: "MAVR Lab Pte Ltd",
    role: "Full Stack Software Engineer",
    period: "Mar 2026 – Present",
    type: "Remote",
    bullets: [
      "Developing and maintaining a full-stack web application using Next.js, Node.js, and TypeScript, focusing on scalability, performance, and seamless user experience",
      "Building server-rendered and API-driven features to support dynamic, real-time application behavior",
      "Integrating AI-driven capabilities using modern LLM platforms while maintaining abstraction and system flexibility",
      "Implementing state management and responsive UI using Zustand and Tailwind CSS",
      "Utilizing Payload CMS for role-based access control (RBAC) and system configuration, with ongoing improvements toward more advanced data retrieval architectures",
      "Deploying and managing containerized services using Docker and AWS infrastructure",
    ],
    stack: ["Next.js", "Node.js", "TypeScript", "Zustand", "Tailwind CSS", "Payload CMS", "Docker", "AWS"],
  },
  {
    company: "Miller Solutions Development Inc.",
    role: "Software Developer",
    period: "Jun 2024 – Mar 2026",
    type: "Hybrid",
    bullets: [
      "Developed and delivered client-facing web applications using Vue.js, Nuxt.js, and modern UI frameworks (Vuetify, PrimeVue, Nuxt UI)",
      "Built and integrated RESTful APIs to support efficient frontend–backend communication",
      "Designed and implemented an end-to-end object detection pipeline using Python and YOLO-based models for automated image processing",
      "Developed a FastAPI backend to expose scalable AI inference services",
      "Managed source control and collaborated across multiple projects using Git and Trello in a fast-paced environment",
    ],
    stack: ["Vue.js", "Nuxt.js", "Vuetify", "PrimeVue", "Python", "FastAPI", "YOLO", "Git"],
  },
  {
    company: "Kyocera Document Solutions Development Inc.",
    role: "Software Engineer",
    period: "Mar 2023 – May 2024",
    type: "Hybrid",
    bullets: [
      "Developed and maintained C/C++ firmware components for embedded printer systems, improving system reliability and device functionality",
      "Integrated SOAP-based services to enable communication between embedded devices and external platforms",
      "Debugged and validated firmware across simulators, virtual environments, and physical hardware",
      "Managed code integration and version control using Perforce in a multi-developer environment",
      "Collaborated with cross-functional teams using JIRA and Confluence for task tracking and technical documentation",
      "Performed remote debugging, build management, and system troubleshooting",
    ],
    stack: ["C", "C++", "SOAP", "Perforce", "JIRA", "Confluence"],
  },
];
