import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { openUrl } from "@tauri-apps/plugin-opener";
import { env, SPOTIFY_SCOPES } from "@/config/env";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "@/lib/pkce";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** epoch ms */
  expiresAt: number;
}

interface OAuthCallbackPayload {
  code?: string;
  state?: string;
  error?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Authorization Code Flow with PKCE against a loopback redirect
 * (http://127.0.0.1:<port>), per RFC 8252. The login page is
 * opened in the user's default browser rather than an embedded webview so
 * Aurora never sees the user's Spotify credentials directly.
 */
export class SpotifyAuthService {
  private pendingState: string | null = null;

  async login(): Promise<TokenSet> {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();
    this.pendingState = state;

    const authorizeUrl = new URL(AUTHORIZE_ENDPOINT);
    authorizeUrl.searchParams.set("client_id", env.clientId);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("redirect_uri", env.redirectUri);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("scope", SPOTIFY_SCOPES);

    const callbackPromise = this.waitForCallback();
    // Start the loopback listener before opening the browser so we can't
    // miss the redirect.
    const serverPromise = invoke("start_oauth_loopback", { port: env.loopbackPort });
    await openUrl(authorizeUrl.toString());

    const [payload] = await Promise.all([callbackPromise, serverPromise]);

    if (payload.error) {
      throw new Error(`Spotify-Anmeldung abgelehnt: ${payload.error}`);
    }
    if (!payload.code || payload.state !== this.pendingState) {
      throw new Error("Ungültige OAuth-Antwort (state mismatch oder fehlender code).");
    }

    const tokens = await this.exchangeCode(payload.code, verifier);
    this.pendingState = null;
    await this.persistRefreshToken(tokens.refreshToken);
    return tokens;
  }

  private waitForCallback(): Promise<OAuthCallbackPayload> {
    return new Promise((resolve, reject) => {
      let unlisten: UnlistenFn | undefined;
      const timeout = setTimeout(() => {
        unlisten?.();
        reject(new Error("Zeitüberschreitung beim Warten auf die Spotify-Anmeldung."));
      }, 120_000);

      listen<OAuthCallbackPayload>("oauth://callback", (event) => {
        clearTimeout(timeout);
        unlisten?.();
        resolve(event.payload);
      }).then((fn) => (unlisten = fn));
    });
  }

  private async exchangeCode(code: string, verifier: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.redirectUri,
      client_id: env.clientId,
      code_verifier: verifier,
    });
    return this.requestTokens(body);
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.clientId,
    });
    const tokens = await this.requestTokens(body, refreshToken);
    await this.persistRefreshToken(tokens.refreshToken);
    return tokens;
  }

  private async requestTokens(
    body: URLSearchParams,
    fallbackRefreshToken?: string,
  ): Promise<TokenSet> {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Token-Anfrage fehlgeschlagen (${response.status}): ${text}`);
    }

    const json = (await response.json()) as TokenResponse;
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? fallbackRefreshToken ?? "",
      expiresAt: Date.now() + json.expires_in * 1000,
    };
  }

  private async persistRefreshToken(token: string) {
    if (!token) return;
    try {
      await invoke("save_refresh_token", { token });
    } catch (err) {
      // A failed write to the OS credential store shouldn't block using
      // the app in the current session — worst case the user has to log
      // in again next launch instead of the login silently failing now.
      console.warn("Could not persist Spotify refresh token:", err);
    }
  }

  async loadPersistedRefreshToken(): Promise<string | null> {
    return invoke<string | null>("get_refresh_token");
  }

  async logout(): Promise<void> {
    await invoke("delete_refresh_token");
  }
}

export const spotifyAuthService = new SpotifyAuthService();
