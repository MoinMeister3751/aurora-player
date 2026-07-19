import { useUpdateStore } from "@/store/updateStore";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UpdateBanner() {
  const status = useUpdateStore((s) => s.status);
  const update = useUpdateStore((s) => s.update);
  const progress = useUpdateStore((s) => s.progress);
  const error = useUpdateStore((s) => s.error);
  const dismissed = useUpdateStore((s) => s.dismissed);
  const installUpdate = useUpdateStore((s) => s.installUpdate);
  const dismiss = useUpdateStore((s) => s.dismiss);

  if (dismissed) return null;
  if (status === "idle" || status === "checking") return null;

  return (
    <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-center gap-4 border-b border-aurora-border bg-aurora-surface2/95 px-4 py-2.5 text-sm backdrop-blur animate-fade-in">
      {status === "available" && update && (
        <>
          <span className="text-aurora-text">
            Aurora {update.version} ist verfügbar (aktuell {update.currentVersion}).
          </span>
          <Button variant="primary" className="px-4 py-1.5 text-xs" onClick={() => installUpdate()}>
            Jetzt installieren
          </Button>
          <button
            onClick={dismiss}
            className="text-xs text-aurora-muted hover:text-aurora-text"
            aria-label="Update-Hinweis schließen"
          >
            Später
          </button>
        </>
      )}

      {status === "downloading" && (
        <>
          <Spinner size={16} />
          <span className="text-aurora-text">
            Update wird heruntergeladen
            {progress?.totalBytes
              ? ` (${formatMb(progress.downloadedBytes)} / ${formatMb(progress.totalBytes)})`
              : "…"}
          </span>
        </>
      )}

      {status === "ready" && <span className="text-aurora-text">Update installiert — Neustart…</span>}

      {status === "error" && (
        <>
          <span className="text-red-400">Update fehlgeschlagen: {error}</span>
          <button onClick={dismiss} className="text-xs text-aurora-muted hover:text-aurora-text">
            Schließen
          </button>
        </>
      )}
    </div>
  );
}
