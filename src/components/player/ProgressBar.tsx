import { useState } from "react";

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ProgressBar({
  progressMs,
  durationMs,
  onSeek,
}: {
  progressMs: number;
  durationMs: number;
  onSeek: (ms: number) => void;
}) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const value = dragValue ?? progressMs;
  const percent = durationMs > 0 ? (value / durationMs) * 100 : 0;

  return (
    <div className="w-full max-w-xl select-none">
      <input
        type="range"
        min={0}
        max={durationMs || 1}
        value={value}
        onChange={(e) => setDragValue(Number(e.target.value))}
        onMouseUp={(e) => {
          const ms = Number((e.target as HTMLInputElement).value);
          onSeek(ms);
          setDragValue(null);
        }}
        className="w-full h-1.5 rounded-full appearance-none bg-white/15 accent-aurora-accent cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6ee7b7 ${percent}%, rgba(255,255,255,0.15) ${percent}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-aurora-muted tabular-nums">
        <span>{formatTime(value)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>
    </div>
  );
}
