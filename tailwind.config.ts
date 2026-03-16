import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",
          primary: "#3b82f6",
          accent: "#7c3aed",
        },
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px rgba(59, 130, 246, 0.25)",
      },
    },
  },
};

export default config;
