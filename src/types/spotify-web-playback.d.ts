// Minimal ambient types for the Spotify Web Playback SDK, loaded at runtime
// from https://sdk.scdn.co/spotify-player.js. Only the surface Aurora uses.
export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyWebPlaybackPlayer;
    };
  }

  interface SpotifyWebPlaybackPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (...args: unknown[]) => void): boolean;
    removeListener(event: string): boolean;
    getCurrentState(): Promise<unknown>;
  }
}
