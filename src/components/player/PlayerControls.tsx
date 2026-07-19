import { usePlayerStore } from "@/store/playerStore";

function Icon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  next: "M6 5l10 7-10 7V5zM18 5h2v14h-2z",
  prev: "M18 5v14L8 12l10-7zM6 5H4v14h2z",
  shuffle:
    "M17 3l4 4-4 4V8h-3.5c-.7 0-1.4.4-1.8 1L9 12l2.7 3.5c.5.6 1.2.9 1.9.9H17v-3l4 4-4 4v-3h-3.4c-1.3 0-2.6-.6-3.4-1.7l-2.2-2.9-2.2 2.9C4.9 20.4 3.6 21 2.3 21H1v-2h1.3c.7 0 1.4-.3 1.9-.9L7 15l-2.8-3.6C3.7 10.7 3 10.4 2.3 10.4H1v-2h1.3c1.3 0 2.6.6 3.4 1.7l2.2 2.9 2.2-2.9c.8-1.1 2.1-1.7 3.4-1.7H17V5z",
  repeat:
    "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
};

export function PlayerControls() {
  const playback = usePlayerStore((s) => s.playback);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const isPlaying = playback?.is_playing ?? false;
  const shuffleOn = playback?.shuffle_state ?? false;
  const repeatState = playback?.repeat_state ?? "off";

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={toggleShuffle}
        aria-label="Shuffle"
        className={`transition-colors ${shuffleOn ? "text-aurora-accent" : "text-aurora-muted hover:text-aurora-text"}`}
      >
        <Icon path={ICONS.shuffle} size={18} />
      </button>

      <button onClick={previous} aria-label="Vorheriger Titel" className="text-aurora-text hover:scale-105 transition-transform">
        <Icon path={ICONS.prev} size={26} />
      </button>

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Abspielen"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-aurora-text text-aurora-bg hover:scale-105 transition-transform"
      >
        <Icon path={isPlaying ? ICONS.pause : ICONS.play} size={26} />
      </button>

      <button onClick={next} aria-label="Nächster Titel" className="text-aurora-text hover:scale-105 transition-transform">
        <Icon path={ICONS.next} size={26} />
      </button>

      <button
        onClick={cycleRepeat}
        aria-label="Wiederholen"
        className={`relative transition-colors ${repeatState !== "off" ? "text-aurora-accent" : "text-aurora-muted hover:text-aurora-text"}`}
      >
        <Icon path={ICONS.repeat} size={18} />
        {repeatState === "track" && (
          <span className="absolute -top-1 -right-1 text-[9px] font-bold">1</span>
        )}
      </button>
    </div>
  );
}
