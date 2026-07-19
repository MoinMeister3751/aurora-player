import { openUrl } from "@tauri-apps/plugin-opener";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

export function LoginView() {
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-aurora-bg text-aurora-text">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Aurora</h1>
        <p className="mt-2 text-aurora-muted">Dein persönlicher Fullscreen-Player</p>
      </div>

      {status === "authenticating" ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-aurora-muted">
            Anmeldung läuft im Browser — bitte dort fortfahren…
          </p>
        </div>
      ) : (
        <Button onClick={() => login()}>Mit Spotify anmelden</Button>
      )}

      {error && <p className="max-w-sm text-center text-sm text-red-400">{error}</p>}

      <p className="max-w-md text-center text-xs text-aurora-muted/70">
        Aurora ist ein inoffizieller Companion und nutzt die offizielle Spotify Web API.
        Ein Spotify-Konto ist erforderlich. Für die volle Wiedergabesteuerung wird{" "}
        <button
          onClick={() => openUrl("https://www.spotify.com/premium/")}
          className="underline hover:text-aurora-text"
        >
          Spotify Premium
        </button>{" "}
        benötigt.
      </p>
    </div>
  );
}
