import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface UpdateProgress {
  downloadedBytes: number;
  totalBytes: number | null;
}

/**
 * Thin wrapper around the Tauri updater plugin. The actual HTTP check and
 * download happen on the Rust side against the endpoint configured in
 * tauri.conf.json (GitHub Releases' latest.json) — this class just exposes
 * a small, UI-friendly surface over it.
 */
export class UpdateService {
  async checkForUpdate(): Promise<Update | null> {
    try {
      return await check();
    } catch (err) {
      throw new Error(`Update-Prüfung fehlgeschlagen: ${(err as Error).message}`);
    }
  }

  async downloadAndInstall(update: Update, onProgress?: (p: UpdateProgress) => void): Promise<void> {
    let totalBytes: number | null = null;
    let downloadedBytes = 0;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          totalBytes = event.data.contentLength ?? null;
          onProgress?.({ downloadedBytes: 0, totalBytes });
          break;
        case "Progress":
          downloadedBytes += event.data.chunkLength;
          onProgress?.({ downloadedBytes, totalBytes });
          break;
        case "Finished":
          onProgress?.({ downloadedBytes: totalBytes ?? downloadedBytes, totalBytes });
          break;
      }
    });
  }

  async relaunch(): Promise<void> {
    await relaunch();
  }
}

export const updateService = new UpdateService();
