import type { AmbientPalette } from "@/services/ColorExtractor";

export function AmbientBackground({ palette }: { palette: AmbientPalette | null }) {
  const primary = palette?.primary ?? "#141417";
  const secondary = palette?.secondary ?? "#0a0a0c";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-aurora-bg">
      <div
        className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full blur-[140px] opacity-40 animate-ambient-shift transition-colors duration-1000"
        style={{ backgroundColor: primary }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[70vh] w-[70vh] rounded-full blur-[140px] opacity-30 animate-ambient-shift transition-colors duration-1000"
        style={{ backgroundColor: secondary, animationDelay: "-9s" }}
      />
      <div className="absolute inset-0 bg-aurora-bg/60 backdrop-blur-3xl" />
    </div>
  );
}
