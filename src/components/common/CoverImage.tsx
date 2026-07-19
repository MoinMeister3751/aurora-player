import { useState } from "react";
import { AuroraMark } from "@/components/common/AuroraMark";

/**
 * Renders cover art, falling back to the Aurora mark whenever there's no
 * image at all (Spotify returns `images: null` for some playlists) or the
 * URL fails to load (e.g. a CDN host not covered by CSP). Centralizes both
 * cases so every card/list looks intentional instead of showing a blank
 * box or the browser's broken-image glyph.
 */
export function CoverImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-aurora-surface2 text-aurora-muted ${className ?? ""}`}>
        <AuroraMark className="h-2/5 w-2/5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
