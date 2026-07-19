import { create } from "zustand";
import { useAuthStore } from "@/store/authStore";
import type {
  QueueResponse,
  RecentlyPlayedItem,
  SavedAlbum,
  SearchResults,
  SpotifyPlaylist,
} from "@/types/spotify";

interface LibraryState {
  playlists: SpotifyPlaylist[];
  savedAlbums: SavedAlbum[];
  recentlyPlayed: RecentlyPlayedItem[];
  queue: QueueResponse | null;
  searchQuery: string;
  searchResults: SearchResults | null;
  isSearching: boolean;
  loadedOnce: boolean;

  loadLibrary: () => Promise<void>;
  loadQueue: () => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: [],
  savedAlbums: [],
  recentlyPlayed: [],
  queue: null,
  searchQuery: "",
  searchResults: null,
  isSearching: false,
  loadedOnce: false,

  loadLibrary: async () => {
    const api = useAuthStore.getState().apiClient;
    const [playlists, savedAlbums, recentlyPlayed] = await Promise.all([
      api.getMyPlaylists(),
      api.getSavedAlbums(),
      api.getRecentlyPlayed(),
    ]);
    set({
      playlists: playlists.items,
      savedAlbums: savedAlbums.items,
      recentlyPlayed: recentlyPlayed.items,
      loadedOnce: true,
    });
  },

  loadQueue: async () => {
    const api = useAuthStore.getState().apiClient;
    try {
      const queue = await api.getQueue();
      set({ queue });
    } catch {
      // queue endpoint requires an active session; fail silently, UI
      // shows an empty-queue state instead of an error banner.
    }
  },

  search: (query: string) => {
    set({ searchQuery: query });
    if (searchDebounce) clearTimeout(searchDebounce);

    if (!query.trim()) {
      set({ searchResults: null, isSearching: false });
      return Promise.resolve();
    }

    set({ isSearching: true });
    return new Promise<void>((resolve) => {
      searchDebounce = setTimeout(async () => {
        const api = useAuthStore.getState().apiClient;
        try {
          const results = await api.search(query);
          if (get().searchQuery === query) {
            set({ searchResults: results, isSearching: false });
          }
        } catch {
          set({ isSearching: false });
        }
        resolve();
      }, 300);
    });
  },

  clearSearch: () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    set({ searchQuery: "", searchResults: null, isSearching: false });
  },
}));
