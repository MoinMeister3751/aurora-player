import { openUrl } from "@tauri-apps/plugin-opener";
import type { SpotifyTrack } from "@/types/spotify";

export function TrackInfo({ track }: { track: SpotifyTrack }) {
  const artistNames = track.artists.map((a) => a.name).join(", ");

  return (
    <div className="text-center max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight text-aurora-text">{track.name}</h1>
      <p className="mt-2 text-lg text-aurora-muted">{artistNames}</p>
      <button
        onClick={() => openUrl(track.album.external_urls.spotify)}
        className="mt-1 text-sm text-aurora-muted/70 hover:text-aurora-accent transition-colors underline underline-offset-2"
      >
        {track.album.name}
      </button>
    </div>
  );
}
