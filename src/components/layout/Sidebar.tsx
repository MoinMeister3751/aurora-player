import { useUiStore, type ViewId } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: "now-playing", label: "Jetzt läuft", icon: "M12 3l9 8h-3v9H6v-9H3z" },
  { id: "library", label: "Bibliothek", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "search", label: "Suche", icon: "M11 4a7 7 0 105.3 11.6l4.05 4.05 1.4-1.4-4.05-4.05A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z" },
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
            {user.images[0] && (
              <img src={user.images[0].url} alt="" className="h-8 w-8 rounded-full object-cover" />
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
