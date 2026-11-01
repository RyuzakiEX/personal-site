import type { Tab } from "@/lib/tabs";

// Mirrors the theme colors in tailwind.config.ts.
export const COLORS = {
  navy950: "#0a0f1e",
  navy900: "#0d1b3e",
  navy800: "#1a2a5e",
  navy700: "#1e3a7a",
  cyan: "#00d4ff",
  electric: "#0066ff",
} as const;

// Each tab tints the robot's stage: its rim light, visor and the glow behind it.
export const TAB_ACCENTS: Record<Tab, string> = {
  about: COLORS.cyan,
  experience: "#3d7bff",
  projects: "#9b6bff",
  contact: "#00e5a0",
};
