export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  uri: string;
  release_date: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: { spotify: string };
}

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

export interface PlaybackState {
  device: SpotifyDevice | null;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyTrack | null;
  shuffle_state: boolean;
  repeat_state: "off" | "track" | "context";
  timestamp: number;
}

export interface SpotifyPlaylistTrackRef {
  total: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  // Spotify returns null (not []) for playlists without a computed cover.
  images: SpotifyImage[] | null;
  owner: { display_name: string | null; id: string };
  tracks: SpotifyPlaylistTrackRef;
  uri: string;
  external_urls: { spotify: string };
  collaborative: boolean;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  product: "premium" | "free" | "open" | string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
}

export interface SavedAlbum {
  added_at: string;
  album: SpotifyAlbum;
}

export interface RecentlyPlayedItem {
  played_at: string;
  track: SpotifyTrack;
}

export interface PlaylistTrackItem {
  added_at: string;
  track: SpotifyTrack | null;
}

export interface QueueResponse {
  currently_playing: SpotifyTrack | null;
  queue: SpotifyTrack[];
}

export interface SearchResults {
  tracks?: { items: SpotifyTrack[] };
  albums?: { items: SpotifyAlbum[] };
  artists?: { items: SpotifyArtist[] };
  playlists?: { items: SpotifyPlaylist[] };
}

export interface SpotifyPaging<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
}

export class SpotifyApiError extends Error {
  status: number;
  reason?: string;

  constructor(status: number, message: string, reason?: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.reason = reason;
  }
}
