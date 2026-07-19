export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  /** Built-in themes ship with the app and can't be edited or deleted. */
  builtIn: boolean;
}

export const THEME_COLOR_LABELS: Record<keyof ThemeColors, string> = {
  bg: "Hintergrund",
  surface: "Fläche",
  surface2: "Fläche (hell)",
  border: "Rahmen",
  text: "Text",
  muted: "Text (gedämpft)",
  accent: "Akzent",
};
