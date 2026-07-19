import { create } from "zustand";
import { useAuthStore } from "@/store/authStore";
import { PlaybackManager } from "@/services/PlaybackManager";
import { extractAmbientPalette, type AmbientPalette } from "@/services/ColorExtractor";
import { SpotifyApiError, type PlaybackState } from "@/types/spotify";
import type { PlayerErrorKind } from "@/components/common/errorKind";
import { firstImage } from "@/lib/image";

interface PlayerState {
  manager: PlaybackManager | null;
  playback: PlaybackState | null;
  ambient: AmbientPalette | null;
  /** locally interpolated progress between polls, ms */
  localProgressMs: number;
  isLoading: boolean;
  errorKind: PlayerErrorKind;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (ms: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeat: () => Promise<void>;
  tickLocalProgress: (deltaMs: number) => void;
}

function classifyError(err: unknown): PlayerErrorKind {
  if (err instanceof SpotifyApiError) {
    if (err.status === 404) return "no-device";
    if (err.status === 403 && err.reason === "PREMIUM_REQUIRED") return "premium-required";
    if (err.status === 401) return "session-expired";
  }
  return "unknown";
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  manager: null,
  playback: null,
  ambient: null,
  localProgressMs: 0,
  isLoading: false,
  errorKind: "none",

  initialize: async () => {
    const apiClient = useAuthStore.getState().apiClient;
    const manager = new PlaybackManager(apiClient);
    set({ manager });
    // Best-effort: register Aurora as a Connect device if DRM allows it.
    // Failures here are silent — remote control of an existing device
    // remains fully functional either way.
    void manager.tryInitWebPlaybackSDK(() => useAuthStore.getState().getValidAccessToken());
    await get().refresh();
  },

  refresh: async () => {
    const apiClient = useAuthStore.getState().apiClient;
    set({ isLoading: true });
    try {
      const playback = (await apiClient.getPlaybackState()) ?? null;
      set({
        playback,
        localProgressMs: playback?.progress_ms ?? 0,
        errorKind: playback ? "none" : "no-device",
        isLoading: false,
      });
      const art = firstImage(playback?.item?.album.images)?.url;
      if (art) {
        const ambient = await extractAmbientPalette(art);
        set({ ambient });
      }
    } catch (err) {
      set({ isLoading: false, errorKind: classifyError(err) });
    }
  },

  togglePlay: async () => {
    const { manager, playback } = get();
    if (!manager) return;
    try {
      if (playback?.is_playing) {
        await manager.pause();
        set((s) => (s.playback ? { playback: { ...s.playback, is_playing: false } } : {}));
      } else {
        await manager.play();
        set((s) => (s.playback ? { playback: { ...s.playback, is_playing: true } } : {}));
      }
    } catch (err) {
      set({ errorKind: classifyError(err) });
    }
  },

  next: async () => {
    const { manager } = get();
    if (!manager) return;
    try {
      await manager.next();
      setTimeout(() => get().refresh(), 400);
    } catch (err) {
      set({ errorKind: classifyError(err) });
    }
  },

  previous: async () => {
    const { manager } = get();
    if (!manager) return;
    try {
      await manager.previous();
      setTimeout(() => get().refresh(), 400);
    } catch (err) {
      set({ errorKind: classifyError(err) });
    }
  },

  seek: async (ms: number) => {
    const { manager } = get();
    if (!manager) return;
    set({ localProgressMs: ms });
    try {
      await manager.seek(ms);
    } catch (err) {
      set({ errorKind: classifyError(err) });
    }
  },

  toggleShuffle: async () => {
    const { manager, playback } = get();
    if (!manager || !playback) return;
    const next = !playback.shuffle_state;
    await manager.toggleShuffle(next);
    set({ playback: { ...playback, shuffle_state: next } });
  },

  cycleRepeat: async () => {
    const { manager, playback } = get();
    if (!manager || !playback) return;
    const order: PlaybackState["repeat_state"][] = ["off", "context", "track"];
    const nextState = order[(order.indexOf(playback.repeat_state) + 1) % order.length];
    await manager.setRepeat(nextState);
    set({ playback: { ...playback, repeat_state: nextState } });
  },

  tickLocalProgress: (deltaMs: number) => {
    const { playback, localProgressMs } = get();
    if (!playback?.is_playing || !playback.item) return;
    const next = Math.min(localProgressMs + deltaMs, playback.item.duration_ms);
    set({ localProgressMs: next });
  },
}));
