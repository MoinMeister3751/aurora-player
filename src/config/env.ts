function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

export const env = {
  clientId: required("VITE_SPOTIFY_CLIENT_ID"),
  loopbackPort: Number(import.meta.env.VITE_SPOTIFY_LOOPBACK_PORT || 17845),
  get redirectUri() {
    return (
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
      `http://127.0.0.1:${this.loopbackPort}/callback`
    );
  },
};

export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "streaming",
].join(" ");
