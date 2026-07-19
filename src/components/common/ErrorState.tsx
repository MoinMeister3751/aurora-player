import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import type { PlayerErrorKind } from "@/components/common/errorKind";

const COPY: Record<PlayerErrorKind, { title: string; body: string }> = {
  none: { title: "", body: "" },
  "no-device": {
    title: "Keine aktive Wiedergabe",
    body: "Starte die Wiedergabe auf einem Gerät (Handy, Desktop, Lautsprecher) — Aurora übernimmt dann automatisch die Anzeige und Steuerung.",
  },
  "premium-required": {
    title: "Spotify Premium erforderlich",
    body: "Die Wiedergabesteuerung über die Spotify Web API steht nur Premium-Konten zur Verfügung. Mit Free kannst du weiterhin den aktuellen Titel ansehen.",
  },
  "session-expired": {
    title: "Sitzung abgelaufen",
    body: "Bitte melde dich erneut bei Spotify an.",
  },
  unknown: {
    title: "Etwas ist schiefgelaufen",
    body: "Die Verbindung zu Spotify ist fehlgeschlagen. Versuche es gleich erneut.",
  },
};

export function ErrorState({ kind, onRetry }: { kind: PlayerErrorKind; onRetry?: () => void }) {
  if (kind === "none") return null;
  const copy = COPY[kind];
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto animate-fade-in">
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <p className="text-aurora-muted text-sm leading-relaxed">{copy.body}</p>
      <div className="flex gap-3 mt-2">
        <Button variant="outline" onClick={() => openUrl("https://open.spotify.com")}>
          In Spotify öffnen
        </Button>
        {kind === "session-expired" ? (
          <Button onClick={() => logout()}>Erneut anmelden</Button>
        ) : (
          onRetry && <Button onClick={onRetry}>Erneut versuchen</Button>
        )}
      </div>
    </div>
  );
}
