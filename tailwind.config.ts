import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0d1117",
          subtle: "#14181f",
          card: "#181d26",
          elevated: "#212836",
          border: "#283344",
        },
        parchment: {
          50: "#faf8f5",
          100: "#f3efe6",
          200: "#e6edf3",
          300: "#cbd5e1",
          muted: "#8b949e",
        },
        gold: {
          light: "#fde68a",
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        emerald: {
          subtle: "rgba(16, 185, 129, 0.12)",
          DEFAULT: "#10b981",
          dark: "#059669",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Geist", "Inter", "sans-serif"],
      },
      boxShadow: {
        book: "0 14px 28px rgba(0,0,0,0.45), 0 10px 10px rgba(0,0,0,0.35)",
        "book-hover": "0 22px 40px rgba(0,0,0,0.65), 0 15px 12px rgba(0,0,0,0.45)",
        glow: "0 0 30px -5px rgba(245, 158, 11, 0.3)",
        "glow-emerald": "0 0 30px -5px rgba(16, 185, 129, 0.3)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;

