import { openUrl } from "@tauri-apps/plugin-opener";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";
import { AmbientBackground } from "@/components/player/AmbientBackground";
import { AlbumArt } from "@/components/player/AlbumArt";
import { TrackInfo } from "@/components/player/TrackInfo";
import { ProgressBar } from "@/components/player/ProgressBar";
import { PlayerControls } from "@/components/player/PlayerControls";
import { VolumeSlider } from "@/components/player/VolumeSlider";
import { ErrorState } from "@/components/common/ErrorState";
import { Spinner } from "@/components/common/Spinner";

export function NowPlayingView() {
  const playback = usePlayerStore((s) => s.playback);
  const ambient = usePlayerStore((s) => s.ambient);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const errorKind = usePlayerStore((s) => s.errorKind);
  const localProgressMs = usePlayerStore((s) => s.localProgressMs);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const refresh = usePlayerStore((s) => s.refresh);
  const isFullscreen = useUiStore((s) => s.isFullscreen);
  const toggleFullscreen = useUiStore((s) => s.toggleFullscreen);

  const track = playback?.item;

  return (
    <div className="relative flex h-full min-h-screen flex-col items-center justify-center gap-8 px-8 py-10">
      <AmbientBackground palette={ambient} />

      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
        className="absolute right-6 top-6 rounded-full p-2 text-aurora-muted hover:bg-white/10 hover:text-aurora-text transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isFullscreen ? (
            <path d="M9 3v4a2 2 0 01-2 2H3M21 8h-4a2 2 0 01-2-2V3M3 16h4a2 2 0 012 2v4M16 21v-4a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M3 9V5a2 2 0 012-2h4M21 9V5a2 2 0 00-2-2h-4M3 15v4a2 2 0 002 2h4M21 15v4a2 2 0 01-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </button>

      {isLoading && !track && (
        <div className="flex flex-col items-center gap-3">
          <Spinner size={32} />
        </div>
      )}

      {!isLoading && errorKind !== "none" && !track && (
        <ErrorState kind={errorKind} onRetry={refresh} />
      )}

      {track && (
        <>
          <AlbumArt images={track.album.images} alt={track.album.name} size={380} />
          <TrackInfo track={track} />
          <ProgressBar
            progressMs={localProgressMs}
            durationMs={track.duration_ms}
            onSeek={seek}
          />
          <PlayerControls />

          {playback?.device?.volume_percent != null && (
            <VolumeSlider percent={playback.device.volume_percent} onChange={setVolume} />
          )}

          <div className="mt-2 flex items-center gap-4 text-xs text-aurora-muted/70">
            <span>Wiedergabe über Spotify</span>
            <button
              onClick={() => openUrl(track.external_urls.spotify)}
              className="underline underline-offset-2 hover:text-aurora-text"
            >
              In Spotify öffnen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
