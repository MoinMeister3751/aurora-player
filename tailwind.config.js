/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: "#0a0a0c",
          surface: "#131316",
          surface2: "#1b1b1f",
          border: "#26262b",
          text: "#f2f2f3",
          muted: "#9a9aa2",
          accent: "#6ee7b7",
        },
      },
      fontFamily: {
        display: ["'Neue Haas Grotesk'", "'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-out",
        "ambient-shift": "ambientShift 18s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        ambientShift: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.15) rotate(6deg)" },
        },
      },
    },
  },
  plugins: [],
};
