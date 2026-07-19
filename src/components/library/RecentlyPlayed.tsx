import type { RecentlyPlayedItem } from "@/types/spotify";
import { firstImage } from "@/lib/image";

export function RecentlyPlayed({ items }: { items: RecentlyPlayedItem[] }) {
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    if (seen.has(item.track.id)) return false;
    seen.add(item.track.id);
    return true;
  });

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">Zuletzt gehört</h2>
      <div className="flex flex-col gap-1">
        {unique.slice(0, 8).map((item) => (
          <div
            key={`${item.track.id}-${item.played_at}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
          >
            {firstImage(item.track.album.images) && (
              <img
                src={firstImage(item.track.album.images)!.url}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm text-aurora-text">{item.track.name}</p>
              <p className="truncate text-xs text-aurora-muted">
                {item.track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>
        ))}
        {unique.length === 0 && (
          <p className="text-sm text-aurora-muted">Noch keine Wiedergabe-Historie.</p>
        )}
      </div>
    </section>
  );
}
