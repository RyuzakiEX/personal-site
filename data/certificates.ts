export interface Certificate {
  title: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

export const certificates: Certificate[] = [
  {
    title: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services",
    year: "2024",
    credentialUrl: "#",
  },
  {
    title: "Professional Scrum Master I",
    issuer: "Scrum.org",
    year: "2023",
    credentialUrl: "#",
  },
  {
    title: "Meta Front-End Developer",
    issuer: "Meta / Coursera",
    year: "2022",
    credentialUrl: "#",
  },
  {
    title: "Google IT Automation with Python",
    issuer: "Google / Coursera",
    year: "2021",
    credentialUrl: "#",
  },
];
