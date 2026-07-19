import type { AmbientPalette } from "@/services/ColorExtractor";

export function AmbientBackground({ palette }: { palette: AmbientPalette | null }) {
  const primary = palette?.primary ?? "#141417";
  const secondary = palette?.secondary ?? "#0a0a0c";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-aurora-bg">
      <div
        className="absolute -top-1/3 -left-1/4 h-[85vh] w-[85vh] rounded-full blur-[120px] opacity-70 animate-ambient-shift transition-colors duration-1000"
        style={{ backgroundColor: primary }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[75vh] w-[75vh] rounded-full blur-[120px] opacity-60 animate-ambient-shift transition-colors duration-1000"
        style={{ backgroundColor: secondary, animationDelay: "-9s" }}
      />
      {/* Vignette centered on the track info/controls for legibility —
          much lighter than a flat scrim so the extracted colors still
          read clearly at the edges instead of being washed to near-black. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,12,0.45)_0%,rgba(10,10,12,0.15)_55%,rgba(10,10,12,0.35)_100%)]" />
    </div>
  );
}
