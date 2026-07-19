import type { SpotifyTrack } from "@/types/spotify";
import { smallestImage } from "@/lib/image";

export function QueueList({ tracks }: { tracks: SpotifyTrack[] }) {
  if (tracks.length === 0) {
    return <p className="text-sm text-aurora-muted">Die Warteschlange ist leer.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {tracks.slice(0, 15).map((track, i) => (
        <div key={`${track.id}-${i}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
          <span className="w-4 text-right text-xs text-aurora-muted">{i + 1}</span>
          {smallestImage(track.album.images) && (
            <img
              src={smallestImage(track.album.images)!.url}
              alt=""
              className="h-9 w-9 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm text-aurora-text">{track.name}</p>
            <p className="truncate text-xs text-aurora-muted">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
