export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Lädt"
      className="animate-spin rounded-full border-2 border-white/20 border-t-aurora-accent"
      style={{ width: size, height: size }}
    />
  );
}
