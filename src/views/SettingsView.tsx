import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { ThemeSwatch } from "@/components/settings/ThemeSwatch";
import { ThemeEditor } from "@/components/settings/ThemeEditor";
import { UpdateSection } from "@/components/settings/UpdateSection";
import { Button } from "@/components/common/Button";
import type { Theme, ThemeColors } from "@/types/theme";

export function SettingsView() {
  const themes = useThemeStore((s) => s.themes);
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);
  const createCustomTheme = useThemeStore((s) => s.createCustomTheme);
  const updateCustomTheme = useThemeStore((s) => s.updateCustomTheme);
  const deleteCustomTheme = useThemeStore((s) => s.deleteCustomTheme);

  const [editing, setEditing] = useState<Theme | "new" | null>(null);

  const builtInThemes = themes.filter((t) => t.builtIn);
  const customThemes = themes.filter((t) => !t.builtIn);

  function handleSave(name: string, colors: ThemeColors) {
    if (editing === "new") {
      createCustomTheme(name, colors);
    } else if (editing) {
      updateCustomTheme(editing.id, name, colors);
    }
    setEditing(null);
  }

  return (
    <div className="px-8 py-10">
      <h1 className="mb-8 text-2xl font-bold">Einstellungen</h1>

      <UpdateSection />

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Theme</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {builtInThemes.map((theme) => (
            <ThemeSwatch
              key={theme.id}
              theme={theme}
              isActive={theme.id === activeThemeId}
              onSelect={() => setActiveTheme(theme.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Eigene Themes</h2>
          {editing === null && (
            <Button variant="outline" onClick={() => setEditing("new")}>
              Neues Theme erstellen
            </Button>
          )}
        </div>

        {editing && (
          <div className="mb-6">
            <ThemeEditor
              initial={editing === "new" ? undefined : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {customThemes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {customThemes.map((theme) => (
              <ThemeSwatch
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                onSelect={() => setActiveTheme(theme.id)}
                onEdit={() => setEditing(theme)}
                onDelete={() => deleteCustomTheme(theme.id)}
              />
            ))}
          </div>
        ) : (
          !editing && (
            <p className="text-sm text-aurora-muted">
              Noch keine eigenen Themes — erstelle eins mit frei wählbaren Farben.
            </p>
          )
        )}
      </section>
    </div>
  );
}
