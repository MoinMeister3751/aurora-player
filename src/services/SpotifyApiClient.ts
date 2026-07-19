import { SpotifyApiError } from "@/types/spotify";
import type {
  PlaybackState,
  PlaylistTrackItem,
  QueueResponse,
  RecentlyPlayedItem,
  SavedAlbum,
  SearchResults,
  SpotifyPaging,
  SpotifyPlaylist,
  SpotifyUserProfile,
} from "@/types/spotify";

const BASE_URL = "https://api.spotify.com/v1";

export type AccessTokenProvider = () => Promise<string>;

/**
 * Thin wrapper around the Spotify Web API. Handles auth headers, 429
 * rate-limit backoff (Retry-After), and surfaces API errors as
 * SpotifyApiError so views can render targeted error states (no active
 * device, Premium required, expired session, ...).
 */
export class SpotifyApiClient {
  constructor(private getAccessToken: AccessTokenProvider) {}

  private async request<T>(
    path: string,
    init: RequestInit = {},
    retry = true,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

    if (response.status === 429 && retry) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((r) => setTimeout(r, (retryAfter + 0.5) * 1000));
      return this.request<T>(path, init, false);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      let reason: string | undefined;
      try {
        const body = await response.json();
        reason = body?.error?.reason ?? body?.error?.message;
      } catch {
        /* no json body */
      }
      throw new SpotifyApiError(response.status, `Spotify API ${response.status}`, reason);
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  // --- Profile -------------------------------------------------------

  getCurrentUser() {
    return this.request<SpotifyUserProfile>("/me");
  }

  // --- Playback --------------------------------------------------------

  getPlaybackState() {
    return this.request<PlaybackState | undefined>("/me/player");
  }

  getQueue() {
    return this.request<QueueResponse>("/me/player/queue");
  }

  play(deviceId?: string, body?: { context_uri?: string; uris?: string[]; offset?: unknown }) {
    const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
    return this.request<void>(`/me/player/play${qs}`, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  pause(deviceId?: string) {
    const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
    return this.request<void>(`/me/player/pause${qs}`, { method: "PUT" });
  }

  next() {
    return this.request<void>("/me/player/next", { method: "POST" });
  }

  previous() {
    return this.request<void>("/me/player/previous", { method: "POST" });
  }

  seek(positionMs: number) {
    return this.request<void>(`/me/player/seek?position_ms=${Math.round(positionMs)}`, {
      method: "PUT",
    });
  }

  setShuffle(state: boolean) {
    return this.request<void>(`/me/player/shuffle?state=${state}`, { method: "PUT" });
  }

  setRepeat(state: "off" | "track" | "context") {
    return this.request<void>(`/me/player/repeat?state=${state}`, { method: "PUT" });
  }

  transferPlayback(deviceId: string, play = false) {
    return this.request<void>("/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [deviceId], play }),
    });
  }

  // --- Library / browsing ----------------------------------------------

  getRecentlyPlayed(limit = 20) {
    return this.request<SpotifyPaging<RecentlyPlayedItem> & { items: RecentlyPlayedItem[] }>(
      `/me/player/recently-played?limit=${limit}`,
    );
  }

  getMyPlaylists(limit = 50) {
    return this.request<SpotifyPaging<SpotifyPlaylist>>(`/me/playlists?limit=${limit}`);
  }

  getPlaylist(id: string) {
    return this.request<SpotifyPlaylist>(`/playlists/${id}`);
  }

  getPlaylistTracks(id: string, limit = 100) {
    return this.request<SpotifyPaging<PlaylistTrackItem>>(
      `/playlists/${id}/tracks?limit=${limit}`,
    );
  }

  getSavedAlbums(limit = 50) {
    return this.request<SpotifyPaging<SavedAlbum>>(`/me/albums?limit=${limit}`);
  }

  search(query: string, types: string[] = ["track", "album", "artist", "playlist"], limit = 12) {
    const params = new URLSearchParams({
      q: query,
      type: types.join(","),
      limit: String(limit),
    });
    return this.request<SearchResults>(`/search?${params.toString()}`);
  }
}
