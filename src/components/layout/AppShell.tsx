import { useUiStore } from "@/store/uiStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { NowPlayingView } from "@/views/NowPlayingView";
import { LibraryView } from "@/views/LibraryView";
import { PlaylistDetailView } from "@/views/PlaylistDetailView";
import { SearchView } from "@/views/SearchView";

export function AppShell() {
  const view = useUiStore((s) => s.view);
  const isFullscreen = useUiStore((s) => s.isFullscreen);
  const selectedPlaylistId = useUiStore((s) => s.selectedPlaylistId);

  const hideSidebar = isFullscreen && view === "now-playing";

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-aurora-bg text-aurora-text">
      {!hideSidebar && <Sidebar />}
      <main className="relative flex-1 overflow-y-auto">
        {view === "now-playing" && <NowPlayingView />}
        {view === "library" && <LibraryView />}
        {view === "playlist" && selectedPlaylistId && (
          <PlaylistDetailView playlistId={selectedPlaylistId} />
        )}
        {view === "search" && <SearchView />}
      </main>
    </div>
  );
}
