import type { Theme } from "@/types/theme";

export function ThemeSwatch({
  theme,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: {
  theme: Theme;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors ${
        isActive ? "border-aurora-accent" : "border-aurora-border hover:border-aurora-muted"
      }`}
    >
      <button onClick={onSelect} className="flex flex-col gap-3 text-left">
        <div
          className="flex h-16 w-full overflow-hidden rounded-lg border border-aurora-border"
          style={{ backgroundColor: theme.colors.bg }}
        >
          <div className="flex flex-1 items-end p-2" style={{ backgroundColor: theme.colors.surface }}>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: theme.colors.accent }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-aurora-text">{theme.name}</span>
          {isActive && <span className="text-xs text-aurora-accent">Aktiv</span>}
        </div>
      </button>

      {!theme.builtIn && (onEdit || onDelete) && (
        <div className="flex gap-3 text-xs text-aurora-muted opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button onClick={onEdit} className="hover:text-aurora-text">
              Bearbeiten
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="hover:text-red-400">
              Löschen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
