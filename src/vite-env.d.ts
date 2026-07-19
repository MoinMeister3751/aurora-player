/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID: string;
  readonly VITE_SPOTIFY_REDIRECT_URI: string;
  readonly VITE_SPOTIFY_LOOPBACK_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
