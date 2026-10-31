export type Tab = "about" | "experience" | "projects" | "contact";

// Navbar order. Moving to a later tab turns the content one way, an earlier
// tab the other.
export const TAB_ORDER: Tab[] = ["about", "experience", "projects", "contact"];

export const SITE_URL = "https://jorgeadanza.vercel.app";
export const SITE_NAME = "Jorge Adanza";
export const HOME_TITLE = "Jorge Adanza — Full Stack Developer";

// Each tab is its own page, so it can be linked to, indexed and reached with
// the back button. About Me is the home page.
export const TABS: Record<
  Tab,
  { label: string; path: string; title: string; description: string }
> = {
  about: {
    label: "About Me",
    path: "/",
    title: HOME_TITLE,
    description:
      "Portfolio of Jorge Adanza, Full Stack Developer specializing in modern web technologies.",
  },
  experience: {
    label: "Experience",
    path: "/experience",
    title: `Experience — ${SITE_NAME}`,
    description:
      "Jorge Adanza's work history as a Full Stack Developer: roles, companies and the technologies used.",
  },
  projects: {
    label: "Projects",
    path: "/projects",
    title: `Projects — ${SITE_NAME}`,
    description:
      "Projects built by Jorge Adanza, from an interactive 3D portfolio to full stack web apps.",
  },
  contact: {
    label: "Contact",
    path: "/contact",
    title: `Contact — ${SITE_NAME}`,
    description: "Get in touch with Jorge Adanza about work, projects or collaborations.",
  },
};

export function tabFromPath(pathname: string | null): Tab {
  return TAB_ORDER.find((tab) => TABS[tab].path === pathname) ?? "about";
}
