import { useEffect } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useAuthStore } from "@/store/authStore";

const POLL_INTERVAL_MS = 5000;
const TICK_INTERVAL_MS = 500;

/**
 * Polls Spotify for authoritative playback state every 5s (Spotify has no
 * push/webhook API for this) and interpolates progress locally in between
 * so the progress bar doesn't visibly stutter. No-ops while signed out.
 */
export function usePlaybackPolling() {
  useEffect(() => {
    const poll = setInterval(() => {
      if (useAuthStore.getState().status !== "signed-in") return;
      usePlayerStore.getState().refresh();
    }, POLL_INTERVAL_MS);

    const tick = setInterval(() => {
      if (useAuthStore.getState().status !== "signed-in") return;
      usePlayerStore.getState().tickLocalProgress(TICK_INTERVAL_MS);
    }, TICK_INTERVAL_MS);

    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);
}
