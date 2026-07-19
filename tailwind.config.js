/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // References CSS custom properties (set in index.css and
        // overridden at runtime by the theme system) instead of static
        // hex values, so themes can be switched/created without a rebuild.
        aurora: {
          bg: "var(--aurora-bg)",
          surface: "var(--aurora-surface)",
          surface2: "var(--aurora-surface2)",
          border: "var(--aurora-border)",
          text: "var(--aurora-text)",
          muted: "var(--aurora-muted)",
          accent: "var(--aurora-accent)",
        },
      },
      fontFamily: {
        display: ["'Neue Haas Grotesk'", "'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
