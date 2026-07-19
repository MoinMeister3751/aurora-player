import type { SpotifyImage } from "@/types/spotify";

/**
 * Renders cover art at its native aspect ratio inside a fixed square
 * frame — never cropped, stretched, or overlaid with UI chrome, per
 * Spotify's artwork guidelines.
 */
export function AlbumArt({
  images,
  alt,
  size = 420,
}: {
  images: SpotifyImage[];
  alt: string;
  size?: number;
}) {
  const image = images[0];

  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-aurora-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
      style={{ width: size, height: size }}
    >
      {image ? (
        <img
          src={image.url}
          alt={alt}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="h-full w-full bg-aurora-surface2" />
      )}
    </div>
  );
}
