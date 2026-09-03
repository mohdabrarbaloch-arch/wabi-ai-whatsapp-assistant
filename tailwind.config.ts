import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f3", 100: "#d7f1e4", 200: "#b2e4cc", 300: "#82d2ae",
          400: "#4fba8d", 500: "#25a06e", 600: "#1a8259", 700: "#156847",
          800: "#125339", 900: "#0f4430",
        },
        ink: { DEFAULT: "#0f172a", soft: "#475569" },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: { "fade-up": "fade-up 0.35s ease-out both", "fade-in": "fade-in 0.25s ease-out both" },
    },
  },
  plugins: [],
};
export default config;