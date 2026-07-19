import type { SpotifyPlaylist } from "@/types/spotify";
import { firstImage } from "@/lib/image";
import { CoverImage } from "@/components/common/CoverImage";

export function PlaylistCard({
  playlist,
  onClick,
}: {
  playlist: SpotifyPlaylist;
  onClick: () => void;
}) {
  const image = firstImage(playlist.images);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white/5"
    >
      <CoverImage
        src={image?.url}
        alt=""
        className="aspect-square w-full overflow-hidden rounded-lg object-cover"
      />
      <div>
        <p className="truncate text-sm font-medium text-aurora-text">{playlist.name}</p>
        <p className="truncate text-xs text-aurora-muted">
          {playlist.owner.display_name ?? playlist.owner.id} · {playlist.tracks.total} Titel
        </p>
      </div>
    </button>
  );
}
