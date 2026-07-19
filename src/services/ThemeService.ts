import { load, type Store } from "@tauri-apps/plugin-store";
import type { Theme } from "@/types/theme";

const STORE_FILE = "themes.json";
const CUSTOM_THEMES_KEY = "customThemes";
const ACTIVE_THEME_KEY = "activeThemeId";

/**
 * Persists custom themes and the active theme choice to a JSON file via
 * tauri-plugin-store (app data dir), and applies a theme by writing CSS
 * custom properties onto the document root — Tailwind's `aurora-*` colors
 * all reference these variables, so this is enough to re-theme the whole
 * app instantly without a rebuild.
 */
export class ThemeService {
  private storePromise: Promise<Store> | null = null;

  private getStore(): Promise<Store> {
    if (!this.storePromise) {
      this.storePromise = load(STORE_FILE, { autoSave: true });
    }
    return this.storePromise;
  }

  applyTheme(theme: Theme) {
    const root = document.documentElement.style;
    root.setProperty("--aurora-bg", theme.colors.bg);
    root.setProperty("--aurora-surface", theme.colors.surface);
    root.setProperty("--aurora-surface2", theme.colors.surface2);
    root.setProperty("--aurora-border", theme.colors.border);
    root.setProperty("--aurora-text", theme.colors.text);
    root.setProperty("--aurora-muted", theme.colors.muted);
    root.setProperty("--aurora-accent", theme.colors.accent);
  }

  async loadCustomThemes(): Promise<Theme[]> {
    const store = await this.getStore();
    return (await store.get<Theme[]>(CUSTOM_THEMES_KEY)) ?? [];
  }

  async saveCustomThemes(themes: Theme[]): Promise<void> {
    const store = await this.getStore();
    await store.set(CUSTOM_THEMES_KEY, themes);
  }

  async loadActiveThemeId(): Promise<string | null> {
    const store = await this.getStore();
    return (await store.get<string>(ACTIVE_THEME_KEY)) ?? null;
  }

  async saveActiveThemeId(id: string): Promise<void> {
    const store = await this.getStore();
    await store.set(ACTIVE_THEME_KEY, id);
  }
}

export const themeService = new ThemeService();
