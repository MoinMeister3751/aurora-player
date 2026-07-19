import { useEffect, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";
import { Spinner } from "@/components/common/Spinner";
import { CoverImage } from "@/components/common/CoverImage";
import { firstImage, smallestImage } from "@/lib/image";
import type { PlaylistTrackItem, SpotifyPlaylist } from "@/types/spotify";

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlaylistDetailView({ playlistId }: { playlistId: string }) {
  const apiClient = useAuthStore((s) => s.apiClient);
  const manager = usePlayerStore((s) => s.manager);
  const navigate = useUiStore((s) => s.navigate);

  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([apiClient.getPlaylist(playlistId), apiClient.getPlaylistTracks(playlistId)]).then(
      ([playlistData, trackPage]) => {
        if (cancelled) return;
        setPlaylist(playlistData);
        setTracks(trackPage.items);
        setIsLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [apiClient, playlistId]);

  if (isLoading || !playlist) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <button
        onClick={() => navigate("library")}
        className="mb-6 text-sm text-aurora-muted hover:text-aurora-text"
      >
        ← Zurück zur Bibliothek
      </button>

      <div className="mb-8 flex items-end gap-6">
        <CoverImage
          src={firstImage(playlist.images)?.url}
          alt=""
          className="h-40 w-40 flex-shrink-0 rounded-lg object-cover shadow-lg"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-aurora-muted">Playlist</p>
          <h1 className="mt-1 text-3xl font-bold">{playlist.name}</h1>
          <p className="mt-2 text-sm text-aurora-muted">
            {playlist.owner.display_name ?? playlist.owner.id} · {playlist.tracks.total} Titel
          </p>
          <button
            onClick={() => openUrl(playlist.external_urls.spotify)}
            className="mt-2 text-xs text-aurora-muted underline underline-offset-2 hover:text-aurora-text"
          >
            In Spotify öffnen
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {tracks
          .filter((item): item is PlaylistTrackItem & { track: NonNullable<PlaylistTrackItem["track"]> } => !!item.track)
          .map((item, i) => (
            <button
              key={`${item.track.id}-${i}`}
              onClick={() => manager?.play({ context_uri: playlist.uri, offset: { position: i } })}
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5"
            >
              <span className="text-right text-xs text-aurora-muted">{i + 1}</span>
              <div className="flex min-w-0 items-center gap-3">
                <CoverImage
                  src={smallestImage(item.track.album.images)?.url}
                  alt=""
                  className="h-10 w-10 flex-shrink-0 rounded object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-aurora-text">{item.track.name}</p>
                  <p className="truncate text-xs text-aurora-muted">
                    {item.track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </div>
              <span className="text-xs text-aurora-muted tabular-nums">
                {formatDuration(item.track.duration_ms)}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
