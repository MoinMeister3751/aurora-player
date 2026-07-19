import type { Theme } from "@/types/theme";

export const BUILT_IN_THEMES: Theme[] = [
  {
    id: "aurora",
    name: "Aurora",
    builtIn: true,
    colors: {
      bg: "#0a0a0c",
      surface: "#131316",
      surface2: "#1b1b1f",
      border: "#26262b",
      text: "#f2f2f3",
      muted: "#9a9aa2",
      accent: "#6ee7b7",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    builtIn: true,
    colors: {
      bg: "#060a14",
      surface: "#0d1526",
      surface2: "#14203a",
      border: "#1f2d4d",
      text: "#eef2fb",
      muted: "#8b95b3",
      accent: "#5b8cff",
    },
  },
  {
    id: "ember",
    name: "Ember",
    builtIn: true,
    colors: {
      bg: "#120a08",
      surface: "#1c1210",
      surface2: "#271815",
      border: "#3a201a",
      text: "#f7ede7",
      muted: "#b89c8f",
      accent: "#ff8a4c",
    },
  },
  {
    id: "violet-dusk",
    name: "Violet Dusk",
    builtIn: true,
    colors: {
      bg: "#0d0a14",
      surface: "#17121f",
      surface2: "#211a2e",
      border: "#332947",
      text: "#f1edf9",
      muted: "#a99bc2",
      accent: "#b98bff",
    },
  },
  {
    id: "daylight",
    name: "Daylight",
    builtIn: true,
    colors: {
      bg: "#f7f7f8",
      surface: "#ffffff",
      surface2: "#f0f0f2",
      border: "#e2e2e6",
      text: "#17171a",
      muted: "#6b6b73",
      accent: "#10b981",
    },
  },
];

export const DEFAULT_THEME_ID = "aurora";
