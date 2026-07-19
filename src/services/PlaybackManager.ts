import type { SpotifyApiClient } from "@/services/SpotifyApiClient";

const SDK_SRC = "https://sdk.scdn.co/spotify-player.js";

/**
 * Bridges Aurora's controls to Spotify playback.
 *
 * Aurora prefers controlling an already-active Spotify device (desktop app,
 * phone, speaker, ...) through the Web API — this always works, requires no
 * DRM, and matches how most users already listen. It *optionally* tries to
 * register itself as a Spotify Connect device via the Web Playback SDK so
 * Aurora can be the audio source directly, but that path needs Widevine/EME
 * support in the WebView which Tauri's WebView2 does not guarantee. If SDK
 * setup fails for any reason, Aurora silently stays in remote-control mode
 * instead of surfacing a broken "local playback" experience.
 */
export class PlaybackManager {
  private player: SpotifyWebPlaybackPlayer | null = null;
  private sdkDeviceId: string | null = null;

  constructor(private api: SpotifyApiClient) {}

  get deviceId() {
    return this.sdkDeviceId;
  }

  async tryInitWebPlaybackSDK(
    getAccessToken: () => Promise<string>,
  ): Promise<string | null> {
    const drmAvailable = await this.hasWidevineSupport();
    if (!drmAvailable) return null;

    try {
      await this.loadSdkScript();
      const Spotify = window.Spotify;
      if (!Spotify) return null;

      this.player = new Spotify.Player({
        name: "Aurora",
        getOAuthToken: (cb) => {
          getAccessToken().then(cb);
        },
        volume: 0.8,
      });

      const deviceId = await new Promise<string | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 8000);
        this.player!.addListener("ready", (...args: unknown[]) => {
          clearTimeout(timeout);
          const state = args[0] as { device_id: string };
          resolve(state.device_id);
        });
        this.player!.addListener("initialization_error", () => {
          clearTimeout(timeout);
          resolve(null);
        });
        this.player!.addListener("account_error", () => {
          clearTimeout(timeout);
          resolve(null);
        });
        this.player!.connect();
      });

      this.sdkDeviceId = deviceId;
      return deviceId;
    } catch {
      return null;
    }
  }

  private async hasWidevineSupport(): Promise<boolean> {
    if (!("requestMediaKeySystemAccess" in navigator)) return false;
    try {
      await navigator.requestMediaKeySystemAccess("com.widevine.alpha", [
        {
          initDataTypes: ["cenc"],
          videoCapabilities: [{ contentType: 'video/mp4;codecs="avc1.42E01E"' }],
        },
      ]);
      return true;
    } catch {
      return false;
    }
  }

  private loadSdkScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${SDK_SRC}"]`)) {
        resolve();
        return;
      }
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      const script = document.createElement("script");
      script.src = SDK_SRC;
      script.onerror = () => reject(new Error("Web Playback SDK konnte nicht geladen werden."));
      document.body.appendChild(script);
    });
  }

  // --- Remote-control API (works regardless of SDK availability) --------

  play(body?: { context_uri?: string; uris?: string[]; offset?: { position: number } }) {
    return this.api.play(this.sdkDeviceId ?? undefined, body);
  }

  pause() {
    return this.api.pause(this.sdkDeviceId ?? undefined);
  }

  next() {
    return this.api.next();
  }

  previous() {
    return this.api.previous();
  }

  seek(ms: number) {
    return this.api.seek(ms);
  }

  toggleShuffle(next: boolean) {
    return this.api.setShuffle(next);
  }

  setRepeat(mode: "off" | "track" | "context") {
    return this.api.setRepeat(mode);
  }

  activateAsDevice() {
    if (!this.sdkDeviceId) return Promise.resolve();
    return this.api.transferPlayback(this.sdkDeviceId, true);
  }

  dispose() {
    this.player?.disconnect();
    this.player = null;
    this.sdkDeviceId = null;
  }
}
