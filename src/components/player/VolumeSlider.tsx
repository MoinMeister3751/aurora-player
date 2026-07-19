import { useState } from "react";

function SpeakerIcon({ percent }: { percent: number }) {
  const path =
    percent === 0
      ? "M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
      : percent < 50
        ? "M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7"
        : "M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13";

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VolumeSlider({
  percent,
  onChange,
}: {
  percent: number;
  onChange: (percent: number) => void;
}) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [previousPercent, setPreviousPercent] = useState(percent || 50);
  const value = dragValue ?? percent;

  function toggleMute() {
    if (value === 0) {
      onChange(previousPercent || 50);
    } else {
      setPreviousPercent(value);
      onChange(0);
    }
  }

  return (
    <div className="flex w-full max-w-[180px] items-center gap-2 text-aurora-muted">
      <button
        onClick={toggleMute}
        aria-label={value === 0 ? "Stummschaltung aufheben" : "Stummschalten"}
        className="hover:text-aurora-text transition-colors"
      >
        <SpeakerIcon percent={value} />
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value);
          setDragValue(next);
          onChange(next);
        }}
        onMouseUp={() => setDragValue(null)}
        aria-label="Lautstärke"
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-aurora-accent"
        style={{
          background: `linear-gradient(to right, var(--aurora-accent) ${value}%, rgba(255,255,255,0.15) ${value}%)`,
        }}
      />
    </div>
  );
}
