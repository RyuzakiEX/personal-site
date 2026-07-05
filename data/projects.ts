export interface ProjectEntry {
  title: string;
  description: string;
  stack: string[];
  url: string;
  comingSoon?: boolean;
}

export const projects: ProjectEntry[] = [
  {
    title: "Personal Portfolio",
    description:
      "My personal portfolio site built with Next.js and TypeScript, featuring animated transitions, a contact form, and a clean terminal-inspired UI.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel"],
    url: "https://jorgeadanza.vercel.app/",
  },
  {
    title: "Blog App",
    description:
      "A multilingual blog platform with internationalization support, content management via Nuxt Studio, and a polished UI using NuxtUI.",
    stack: [
      "Nuxt.js",
      "Vue",
      "NuxtUI",
      "Nuxt Content",
      "Nuxt Studio",
      "I18N",
      "Vercel",
    ],
    url: "https://blog-app-mu-blond.vercel.app/",
  },
  {
    title: "Buggy Wedding Proposal",
    description:
      'A playful wedding proposal app built for my girlfriend, posing the big yes-or-no question. Hover over "No" and it dodges away, and pressing "Yes" triggers a joyful celebration animation.',
    stack: ["React", "Vercel"],
    url: "https://ladyg-ryu-proposal.vercel.app/",
  },
];
