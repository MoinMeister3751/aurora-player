import { useState } from "react";
import { THEME_COLOR_LABELS, type Theme, type ThemeColors } from "@/types/theme";
import { Button } from "@/components/common/Button";

const FIELD_ORDER: (keyof ThemeColors)[] = [
  "bg",
  "surface",
  "surface2",
  "border",
  "text",
  "muted",
  "accent",
];

export function ThemeEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Theme;
  onSave: (name: string, colors: ThemeColors) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [colors, setColors] = useState<ThemeColors>(
    initial?.colors ?? {
      bg: "#0a0a0c",
      surface: "#131316",
      surface2: "#1b1b1f",
      border: "#26262b",
      text: "#f2f2f3",
      muted: "#9a9aa2",
      accent: "#6ee7b7",
    },
  );

  const canSave = name.trim().length > 0;

  return (
    <div className="rounded-xl border border-aurora-border bg-aurora-surface p-5">
      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-aurora-muted">Name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mein Theme"
          className="w-full max-w-xs rounded-lg border border-aurora-border bg-aurora-surface2 px-3 py-2 text-sm text-aurora-text placeholder:text-aurora-muted focus:outline-none focus:ring-2 focus:ring-aurora-accent"
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FIELD_ORDER.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="color"
              value={colors[key]}
              onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded border border-aurora-border bg-transparent"
            />
            <span className="text-xs text-aurora-muted">{THEME_COLOR_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button disabled={!canSave} onClick={() => onSave(name.trim(), colors)}>
          Speichern
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
