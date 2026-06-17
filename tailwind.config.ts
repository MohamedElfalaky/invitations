import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // English pairing
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        // Arabic pairing
        "arabic-sans": ["var(--font-tajawal)", "Tahoma", "sans-serif"],
        "arabic-serif": ["var(--font-amiri)", "serif"],
      },
      colors: {
        // Neutral, theme-agnostic accents tweaked per-theme via CSS vars where needed.
        ink: "#1a1a2e",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
