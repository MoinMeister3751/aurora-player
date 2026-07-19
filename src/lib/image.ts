import type { SpotifyImage } from "@/types/spotify";

// Spotify's API returns `images: null` (not `[]`) for some objects —
// playlists without a custom cover being the common case. Centralizing
// the null-safe access here avoids "Cannot read properties of null"
// crashes scattered across every card/list component.
export function firstImage(images: SpotifyImage[] | null | undefined): SpotifyImage | undefined {
  return images?.[0];
}

export function smallestImage(images: SpotifyImage[] | null | undefined): SpotifyImage | undefined {
  return images && images.length > 0 ? images[images.length - 1] : undefined;
}
