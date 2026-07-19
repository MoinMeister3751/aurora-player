import { create } from "zustand";
import { spotifyAuthService, type TokenSet } from "@/services/SpotifyAuthService";
import { SpotifyApiClient } from "@/services/SpotifyApiClient";
import type { SpotifyUserProfile } from "@/types/spotify";

type AuthStatus = "checking" | "signed-out" | "authenticating" | "signed-in" | "error";

interface AuthState {
  status: AuthStatus;
  tokens: TokenSet | null;
  user: SpotifyUserProfile | null;
  isPremium: boolean;
  error: string | null;
  apiClient: SpotifyApiClient;

  bootstrap: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string>;
}

// A single refresh-in-flight guard so concurrent 401s don't trigger a
// thundering herd of refresh requests.
let refreshInFlight: Promise<TokenSet> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "checking",
  tokens: null,
  user: null,
  isPremium: false,
  error: null,
  apiClient: new SpotifyApiClient(() => get().getValidAccessToken()),

  bootstrap: async () => {
    try {
      const refreshToken = await spotifyAuthService.loadPersistedRefreshToken();
      if (!refreshToken) {
        set({ status: "signed-out" });
        return;
      }
      const tokens = await spotifyAuthService.refresh(refreshToken);
      set({ tokens, status: "signed-in" });
      const user = await get().apiClient.getCurrentUser();
      set({ user, isPremium: user.product === "premium" });
    } catch (err) {
      set({ status: "signed-out", error: (err as Error).message });
    }
  },

  login: async () => {
    set({ status: "authenticating", error: null });
    try {
      const tokens = await spotifyAuthService.login();
      set({ tokens, status: "signed-in" });
      const user = await get().apiClient.getCurrentUser();
      set({ user, isPremium: user.product === "premium" });
    } catch (err) {
      set({ status: "error", error: (err as Error).message });
    }
  },

  logout: async () => {
    await spotifyAuthService.logout();
    set({ status: "signed-out", tokens: null, user: null, isPremium: false });
  },

  getValidAccessToken: async () => {
    const { tokens } = get();
    if (!tokens) {
      throw new Error("Nicht angemeldet.");
    }
    const isExpiringSoon = Date.now() > tokens.expiresAt - 30_000;
    if (!isExpiringSoon) {
      return tokens.accessToken;
    }

    if (!refreshInFlight) {
      refreshInFlight = spotifyAuthService
        .refresh(tokens.refreshToken)
        .finally(() => (refreshInFlight = null));
    }
    const fresh = await refreshInFlight;
    set({ tokens: fresh });
    return fresh.accessToken;
  },
}));
