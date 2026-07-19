import { useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useLibraryStore } from "@/store/libraryStore";
import { useUiStore } from "@/store/uiStore";
import { PlaylistGrid } from "@/components/library/PlaylistGrid";
import { PlaylistCard } from "@/components/library/PlaylistCard";
import { RecentlyPlayed } from "@/components/library/RecentlyPlayed";
import { QueueList } from "@/components/library/QueueList";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/common/Button";
import { firstImage } from "@/lib/image";

export function LibraryView() {
  const {
    playlists,
    savedAlbums,
    recentlyPlayed,
    queue,
    loadedOnce,
    error,
    loadLibrary,
    loadQueue,
  } = useLibraryStore();
  const navigate = useUiStore((s) => s.navigate);

  useEffect(() => {
    if (!loadedOnce) loadLibrary();
    loadQueue();
  }, [loadedOnce, loadLibrary, loadQueue]);

  if (!loadedOnce) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-aurora-muted">Bibliothek konnte nicht geladen werden: {error}</p>
        <Button variant="outline" onClick={() => loadLibrary()}>
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-10 px-8 py-10">
      <div className="flex-1 min-w-0">
        <RecentlyPlayed items={recentlyPlayed} />

        <PlaylistGrid title="Deine Playlists">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => navigate("playlist", playlist.id)}
            />
          ))}
        </PlaylistGrid>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Gespeicherte Alben</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {savedAlbums.map(({ album }) => (
              <button
                key={album.id}
                onClick={() => openUrl(album.external_urls.spotify)}
                className="flex flex-col gap-2 rounded-lg p-2 text-left hover:bg-white/5"
              >
                {firstImage(album.images) && (
                  <img
                    src={firstImage(album.images)!.url}
                    alt=""
                    className="aspect-square w-full rounded object-cover"
                  />
                )}
                <div>
                  <p className="truncate text-sm text-aurora-text">{album.name}</p>
                  <p className="truncate text-xs text-aurora-muted">
                    {album.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="w-72 flex-shrink-0">
        <h2 className="mb-4 text-lg font-semibold">Warteschlange</h2>
        <QueueList tracks={queue?.queue ?? []} />
      </aside>
    </div>
  );
}
