import { useUiStore, type ViewId } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { firstImage } from "@/lib/image";

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: "now-playing", label: "Jetzt läuft", icon: "M12 3l9 8h-3v9H6v-9H3z" },
  { id: "library", label: "Bibliothek", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "search", label: "Suche", icon: "M11 4a7 7 0 105.3 11.6l4.05 4.05 1.4-1.4-4.05-4.05A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z" },
  {
    id: "settings",
    label: "Einstellungen",
    icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V19a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H5a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H11a1.65 1.65 0 001-1.51V5a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V11a1.65 1.65 0 001.51 1H19a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  },
];

export function Sidebar() {
  const view = useUiStore((s) => s.view);
  const navigate = useUiStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col justify-between border-r border-aurora-border bg-aurora-surface px-4 py-6">
      <div>
        <div className="mb-8 px-2 text-lg font-bold tracking-tight">Aurora</div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                view === item.id
                  ? "bg-aurora-surface2 text-aurora-text"
                  : "text-aurora-muted hover:text-aurora-text hover:bg-white/5"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-2">
        {user && (
          <div className="mb-3 flex items-center gap-2">
            {firstImage(user.images) && (
              <img src={firstImage(user.images)!.url} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
            <span className="truncate text-sm text-aurora-muted">{user.display_name ?? user.id}</span>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="text-xs text-aurora-muted hover:text-aurora-text transition-colors"
        >
          Abmelden
        </button>
      </div>
    </aside>
  );
}
