import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0f1e",
          900: "#0d1b3e",
          800: "#1a2a5e",
          700: "#1e3a7a",
        },
        cyan: {
          glow: "#00d4ff",
        },
        blue: {
          electric: "#0066ff",
        },
      },
      fontFamily: {
        futuristic: ["var(--font-rajdhani)", "var(--font-exo2)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 12px 2px rgba(0, 212, 255, 0.35)",
        "glow-lg": "0 0 24px 4px rgba(0, 212, 255, 0.25)",
        "glow-blue": "0 0 12px 2px rgba(0, 102, 255, 0.4)",
      },
      backgroundImage: {
        "grid-pattern": `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        scanline: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)`,
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 1px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(0,212,255,0.6)" },
        },
      },
      animation: {
        flicker: "flicker 1s step-end infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
