import { create } from "zustand";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type ViewId = "now-playing" | "library" | "search" | "playlist" | "settings";

interface UiState {
  view: ViewId;
  selectedPlaylistId: string | null;
  isFullscreen: boolean;

  navigate: (view: ViewId, playlistId?: string) => void;
  toggleFullscreen: () => Promise<void>;
  syncFullscreenState: () => Promise<void>;
}

export const useUiStore = create<UiState>((set, get) => ({
  view: "now-playing",
  selectedPlaylistId: null,
  isFullscreen: false,

  navigate: (view, playlistId) => set({ view, selectedPlaylistId: playlistId ?? null }),

  toggleFullscreen: async () => {
    const win = getCurrentWindow();
    const next = !get().isFullscreen;
    await win.setFullscreen(next);
    set({ isFullscreen: next });
  },

  syncFullscreenState: async () => {
    const win = getCurrentWindow();
    const isFullscreen = await win.isFullscreen();
    set({ isFullscreen });
  },
}));
