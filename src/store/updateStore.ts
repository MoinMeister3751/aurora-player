import { create } from "zustand";
import type { Update } from "@tauri-apps/plugin-updater";
import { updateService, type UpdateProgress } from "@/services/UpdateService";

type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "ready" | "error";

interface UpdateState {
  status: UpdateStatus;
  update: Update | null;
  progress: UpdateProgress | null;
  error: string | null;
  dismissed: boolean;

  checkForUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismiss: () => void;
}

export const useUpdateStore = create<UpdateState>((set, get) => ({
  status: "idle",
  update: null,
  progress: null,
  error: null,
  dismissed: false,

  checkForUpdate: async () => {
    set({ status: "checking", error: null });
    try {
      const update = await updateService.checkForUpdate();
      if (update?.available) {
        set({ status: "available", update, dismissed: false });
      } else {
        set({ status: "idle", update: null });
      }
    } catch (err) {
      set({ status: "error", error: (err as Error).message });
    }
  },

  installUpdate: async () => {
    const { update } = get();
    if (!update) return;
    set({ status: "downloading", progress: { downloadedBytes: 0, totalBytes: null } });
    try {
      await updateService.downloadAndInstall(update, (progress) => set({ progress }));
      set({ status: "ready" });
      await updateService.relaunch();
    } catch (err) {
      set({ status: "error", error: (err as Error).message });
    }
  },

  dismiss: () => set({ dismissed: true }),
}));
