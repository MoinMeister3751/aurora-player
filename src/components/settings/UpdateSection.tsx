import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { useUpdateStore } from "@/store/updateStore";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UpdateSection() {
  const status = useUpdateStore((s) => s.status);
  const update = useUpdateStore((s) => s.update);
  const progress = useUpdateStore((s) => s.progress);
  const error = useUpdateStore((s) => s.error);
  const checkForUpdate = useUpdateStore((s) => s.checkForUpdate);
  const installUpdate = useUpdateStore((s) => s.installUpdate);

  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [justCheckedUpToDate, setJustCheckedUpToDate] = useState(false);

  useEffect(() => {
    getVersion().then(setCurrentVersion);
  }, []);

  async function handleCheck() {
    setJustCheckedUpToDate(false);
    await checkForUpdate();
    if (useUpdateStore.getState().status === "idle") {
      setJustCheckedUpToDate(true);
    }
  }

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">App-Update</h2>
      <div className="flex flex-col gap-3 rounded-xl border border-aurora-border bg-aurora-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-aurora-muted">
            Aktuelle Version{currentVersion ? `: ${currentVersion}` : ""}
          </p>
          {(status === "idle" || status === "error") && (
            <Button variant="outline" onClick={handleCheck}>
              Nach Updates suchen
            </Button>
          )}
        </div>

        {status === "checking" && (
          <div className="flex items-center gap-2 text-sm text-aurora-muted">
            <Spinner size={16} />
            Suche nach Updates…
          </div>
        )}

        {status === "idle" && justCheckedUpToDate && (
          <p className="text-sm text-aurora-accent">Du bist auf dem neuesten Stand.</p>
        )}

        {status === "available" && update && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-aurora-text">
              Version {update.version} ist verfügbar (aktuell {update.currentVersion}).
            </p>
            <Button onClick={() => installUpdate()}>Installieren</Button>
          </div>
        )}

        {status === "downloading" && (
          <div className="flex items-center gap-2 text-sm text-aurora-muted">
            <Spinner size={16} />
            Wird heruntergeladen
            {progress?.totalBytes
              ? ` (${formatMb(progress.downloadedBytes)} / ${formatMb(progress.totalBytes)})`
              : "…"}
          </div>
        )}

        {status === "ready" && (
          <p className="text-sm text-aurora-muted">Update installiert — Neustart…</p>
        )}

        {status === "error" && <p className="text-sm text-red-400">Fehler: {error}</p>}
      </div>
    </section>
  );
}
