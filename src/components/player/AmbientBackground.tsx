import type { AmbientPalette } from "@/services/ColorExtractor";

/**
 * Full-bleed color wash derived from the current cover art — matching the
 * classic Spotify fullscreen look (a solid, vivid fill of the dominant
 * art color) rather than a subtle blurred-blob glow in the corners.
 */
export function AmbientBackground({ palette }: { palette: AmbientPalette | null }) {
  const primary = palette?.primary ?? "#141417";
  const secondary = palette?.secondary ?? "#0a0a0c";

  return (
    <div
      className="absolute inset-0 -z-10 transition-colors duration-700"
      style={{ background: `linear-gradient(160deg, ${primary} 0%, ${secondary} 100%)` }}
    >
      {/* Gentle vignette centered on the track info/controls, just enough
          to keep text legible without hiding the color wash at the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
