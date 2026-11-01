import type { Config } from "tailwindcss";

const config: Config = {
  content: [
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
        futuristic: ["var(--font-rajdhani)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 12px 2px rgba(0, 212, 255, 0.35)",
        "glow-lg": "0 0 24px 4px rgba(0, 212, 255, 0.25)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "intro-bar": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(300%)" },
        },
      },
      animation: {
        flicker: "flicker 1s step-end infinite",
        "intro-bar": "intro-bar 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
