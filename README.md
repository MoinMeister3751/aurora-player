# Aurora

A nostalgic, fullscreen Now-Playing companion for Spotify — inspired by the
old Spotify fullscreen feel, rebuilt with its own visual identity. Aurora is
an **unofficial, third-party client** built against the official Spotify Web
API. It is not affiliated with, endorsed by, or a replacement for Spotify.

## Tech stack

- Tauri 2 (Rust shell) + React 18 + TypeScript + Tailwind CSS
- Zustand for state management
- Spotify Web API via Authorization Code Flow with PKCE
- Optional Spotify Web Playback SDK (best-effort, see "Playback modes" below)

## Architecture

```
src-tauri/src/
  main.rs             — Tauri entrypoint, registers commands
  oauth_loopback.rs    — one-shot HTTP server on 127.0.0.1:<port>
  secure_store.rs      — refresh token storage in the OS credential manager

src/
  services/
    SpotifyAuthService.ts  — PKCE flow, token exchange & refresh
    SpotifyApiClient.ts    — typed Web API wrapper (auth header, 429 backoff)
    PlaybackManager.ts     — remote-control playback + optional SDK device
    ColorExtractor.ts      — ambient background palette from cover art
  store/                — zustand: auth, player, library, ui
  components/, views/   — UI
```

## Setup

### 1. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   and create an app.
2. Under **Redirect URIs**, add exactly:
   ```
   http://127.0.0.1:17845
   ```
   (Spotify requires a byte-for-byte match — no trailing slash. If you
   change the port in `.env`, update it here too. Aurora's loopback server
   also accepts a `/callback` suffix if you'd rather register that instead
   — see `src-tauri/src/oauth_loopback.rs`.)
3. Copy the **Client ID** (no client secret is needed — this app uses PKCE).

### 2. Configure environment

```bash
cp .env.example .env
# then fill in VITE_SPOTIFY_CLIENT_ID
```

### 3. Install dependencies

```bash
npm install
```

You'll also need the Rust toolchain and Tauri's Windows prerequisites
(MSVC build tools, WebView2 runtime) — see the
[Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/).

### 4. App icons

Generate the icon set Tauri expects (from any square source PNG/SVG):

```bash
npx tauri icon path/to/your-logo.png
```

### 5. Run in development

```bash
npm run tauri dev
```

### 6. Build a Windows installer

```bash
npm run tauri build
```

## Login flow

Aurora opens Spotify's login page in your **default system browser**, not an
embedded webview — this follows the OAuth-for-native-apps best practice
(RFC 8252) so Aurora never sees your Spotify credentials directly. A small
local HTTP listener (`oauth_loopback.rs`) catches the redirect on
`127.0.0.1:<port>`, and the refresh token is stored in the Windows
Credential Manager via the `keyring` crate — not as a plaintext file.

## Playback modes

Aurora controls playback in two ways:

1. **Remote control (default, always available).** Aurora calls the Web
   API's `/me/player/*` endpoints to control whatever Spotify device is
   currently active (desktop app, phone, speaker, ...). This requires
   Spotify Premium and an already-active playback session.
2. **Direct playback via the Web Playback SDK (best-effort).** On startup,
   Aurora feature-detects Widevine/EME support in the WebView and, if
   available, tries to register itself as a Spotify Connect device. Tauri's
   WebView2 does not guarantee Widevine support, so this can silently fail —
   in that case Aurora just stays in remote-control mode. There is no user-
   visible breakage either way.

If no device is active, or the account isn't Premium, Aurora shows a
dedicated error state with an **"Open in Spotify"** fallback link rather than
failing silently.

## Spotify Developer Policy compliance notes

These are the concrete decisions made in this codebase to stay within
Spotify's Developer Terms and Design Guidelines:

- **No Spotify branding in the product name/icon.** The app is called
  "Aurora"; nothing in the UI claims to be an official Spotify product.
- **No re-implementation of Spotify's UI.** Layout, spacing, and components
  are original; only the general "fullscreen now-playing" feeling is kept.
- **Artwork integrity** ([`AlbumArt.tsx`](src/components/player/AlbumArt.tsx)):
  cover art is always rendered via `object-contain` at its native aspect
  ratio, inside a fixed frame, with no UI elements overlaid on top of the
  image itself.
- **Attribution**: every Now Playing view shows "Wiedergabe über Spotify"
  plus a working "In Spotify öffnen" link back to the track/album/playlist
  on open.spotify.com.
- **No audio or artwork caching/persistence.** `ColorExtractor.ts` samples
  cover art into an in-memory canvas only, never writes it to disk, and
  Aurora does not download or cache audio streams at all — playback audio is
  always sourced from Spotify's own client/device.
- **No circumvention of Premium restrictions.** Free-tier accounts see the
  current track (read-only) and a clear "Premium required" state instead of
  a playback UI that silently fails.
- **Scopes are minimal** — see `SPOTIFY_SCOPES` in
  [`src/config/env.ts`](src/config/env.ts). No scopes touch account
  modification, follows, or library writes.

## Installer & auto-updates

Aurora ships as a signed Windows installer (`.msi` / NSIS `.exe`) with a
built-in auto-updater (`tauri-plugin-updater`) that checks
[GitHub Releases](https://github.com/MoinMeister3751/aurora-player/releases)
on startup. Update checks and downloads happen from the Rust side against
`https://github.com/MoinMeister3751/aurora-player/releases/latest/download/latest.json`;
the UI only shows a banner once an update is found.

**Note:** update artifacts on GitHub Releases are fetched with a plain,
unauthenticated HTTP request, so this only works if the repository is
**public**. A private repo would 404 for every user except one with a
GitHub token embedded in the app — which isn't something you want to ship.

### One-time setup (already done in this repo)

1. Generated a signing keypair: `npx tauri signer generate -w src-tauri/aurora-player.key --ci`
   — the public key is committed inline in `tauri.conf.json`
   (`plugins.updater.pubkey`); the private key file is gitignored and must
   never be committed.
2. Added the private key as GitHub Actions secrets under
   **Settings → Secrets and variables → Actions**:
   - `TAURI_SIGNING_PRIVATE_KEY` — contents of `src-tauri/aurora-player.key`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — only if you generated the key
     with a password (this repo's key has none)
   - `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`,
     `VITE_SPOTIFY_LOOPBACK_PORT` — same values as your local `.env`, so CI
     can build a working binary

### Cutting a release

The updater compares **semver version numbers**, not commit hashes — a
release that doesn't bump the version is invisible to the updater.
Before every release, bump the version in all three places (they must
match):

1. `package.json` → `"version"`
2. `src-tauri/tauri.conf.json` → `"version"`
3. `src-tauri/Cargo.toml` → `[package] version`

Then tag and push:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Pushing a `v*.*.*` tag triggers [`.github/workflows/release.yml`](.github/workflows/release.yml),
which builds the Windows installer, signs the updater artifact, and creates
a **draft** GitHub Release with `latest.json` attached. Review the draft,
then publish it — installed copies of Aurora will pick up the update on
their next launch.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Next track |
| `←` | Previous track |
| `F` / `F11` | Toggle fullscreen |
| `Esc` | Exit fullscreen |

## Known limitations

- The Web Playback SDK path depends on WebView2's DRM support, which varies
  by machine/Windows build — remote control is the reliable path.
- Spotify's Web API has no push mechanism for playback state, so Aurora
  polls every 5 seconds and interpolates progress locally in between.
- The Spotify Free tier cannot start/control playback through the Web API
  by design (Spotify platform limitation, not an Aurora restriction).
