import { openUrl } from "@tauri-apps/plugin-opener";
import { useLibraryStore } from "@/store/libraryStore";
import { usePlayerStore } from "@/store/playerStore";
import { Spinner } from "@/components/common/Spinner";

export function SearchResultsList() {
  const results = useLibraryStore((s) => s.searchResults);
  const isSearching = useLibraryStore((s) => s.isSearching);
  const manager = usePlayerStore((s) => s.manager);

  if (isSearching) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!results) {
    return <p className="text-aurora-muted">Suche nach Titeln, Alben, Künstlern oder Playlists.</p>;
  }

  const hasAny =
    (results.tracks?.items.length ?? 0) +
      (results.albums?.items.length ?? 0) +
      (results.artists?.items.length ?? 0) +
      (results.playlists?.items.length ?? 0) >
    0;

  if (!hasAny) {
    return <p className="text-aurora-muted">Keine Ergebnisse gefunden.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {results.tracks && results.tracks.items.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-aurora-muted">
            Titel
          </h3>
          <div className="flex flex-col gap-1">
            {results.tracks.items.map((track) => (
              <button
                key={track.id}
                onClick={() => manager?.play({ uris: [track.uri] })}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5"
              >
                {track.album.images.at(-1) && (
                  <img src={track.album.images.at(-1)!.url} alt="" className="h-10 w-10 rounded object-cover" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm text-aurora-text">{track.name}</p>
                  <p className="truncate text-xs text-aurora-muted">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {results.albums && results.albums.items.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-aurora-muted">
            Alben
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.albums.items.map((album) => (
              <button
                key={album.id}
                onClick={() => openUrl(album.external_urls.spotify)}
                className="flex flex-col gap-2 rounded-lg p-2 text-left hover:bg-white/5"
              >
                {album.images[0] && (
                  <img src={album.images[0].url} alt="" className="aspect-square w-full rounded object-cover" />
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
      )}

      {results.artists && results.artists.items.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-aurora-muted">
            Künstler
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.artists.items.map((artist) => (
              <button
                key={artist.id}
                onClick={() => openUrl(artist.external_urls.spotify)}
                className="rounded-full border border-aurora-border px-4 py-2 text-sm hover:bg-white/5"
              >
                {artist.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {results.playlists && results.playlists.items.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-aurora-muted">
            Playlists
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.playlists.items.filter(Boolean).map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => openUrl(playlist.external_urls.spotify)}
                className="flex flex-col gap-2 rounded-lg p-2 text-left hover:bg-white/5"
              >
                {playlist.images[0] && (
                  <img src={playlist.images[0].url} alt="" className="aspect-square w-full rounded object-cover" />
                )}
                <p className="truncate text-sm text-aurora-text">{playlist.name}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
