import { create } from "zustand";
import { BUILT_IN_THEMES, DEFAULT_THEME_ID } from "@/config/themes";
import { themeService } from "@/services/ThemeService";
import type { Theme, ThemeColors } from "@/types/theme";

function randomId(): string {
  return crypto.randomUUID();
}

interface ThemeState {
  themes: Theme[];
  activeThemeId: string;
  loaded: boolean;

  loadThemes: () => Promise<void>;
  setActiveTheme: (id: string) => Promise<void>;
  createCustomTheme: (name: string, colors: ThemeColors) => Promise<void>;
  updateCustomTheme: (id: string, name: string, colors: ThemeColors) => Promise<void>;
  deleteCustomTheme: (id: string) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: BUILT_IN_THEMES,
  activeThemeId: DEFAULT_THEME_ID,
  loaded: false,

  loadThemes: async () => {
    const [customThemes, activeThemeId] = await Promise.all([
      themeService.loadCustomThemes(),
      themeService.loadActiveThemeId(),
    ]);
    const themes = [...BUILT_IN_THEMES, ...customThemes];
    const resolvedId = themes.some((t) => t.id === activeThemeId)
      ? activeThemeId!
      : DEFAULT_THEME_ID;
    const active = themes.find((t) => t.id === resolvedId) ?? BUILT_IN_THEMES[0];
    themeService.applyTheme(active);
    set({ themes, activeThemeId: resolvedId, loaded: true });
  },

  setActiveTheme: async (id: string) => {
    const theme = get().themes.find((t) => t.id === id);
    if (!theme) return;
    themeService.applyTheme(theme);
    set({ activeThemeId: id });
    await themeService.saveActiveThemeId(id);
  },

  createCustomTheme: async (name: string, colors: ThemeColors) => {
    const theme: Theme = { id: randomId(), name, colors, builtIn: false };
    const customThemes = get().themes.filter((t) => !t.builtIn).concat(theme);
    set({ themes: [...BUILT_IN_THEMES, ...customThemes] });
    await themeService.saveCustomThemes(customThemes);
    await get().setActiveTheme(theme.id);
  },

  updateCustomTheme: async (id: string, name: string, colors: ThemeColors) => {
    const customThemes = get()
      .themes.filter((t) => !t.builtIn)
      .map((t) => (t.id === id ? { ...t, name, colors } : t));
    set({ themes: [...BUILT_IN_THEMES, ...customThemes] });
    await themeService.saveCustomThemes(customThemes);
    if (get().activeThemeId === id) {
      const updated = customThemes.find((t) => t.id === id);
      if (updated) themeService.applyTheme(updated);
    }
  },

  deleteCustomTheme: async (id: string) => {
    const customThemes = get().themes.filter((t) => !t.builtIn && t.id !== id);
    set({ themes: [...BUILT_IN_THEMES, ...customThemes] });
    await themeService.saveCustomThemes(customThemes);
    if (get().activeThemeId === id) {
      await get().setActiveTheme(DEFAULT_THEME_ID);
    }
  },
}));
