import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";
import { useUpdateStore } from "@/store/updateStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlaybackPolling } from "@/hooks/usePlaybackPolling";
import { LoginView } from "@/views/LoginView";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/common/Spinner";
import { UpdateBanner } from "@/components/common/UpdateBanner";

export default function App() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const initializePlayer = usePlayerStore((s) => s.initialize);
  const syncFullscreenState = useUiStore((s) => s.syncFullscreenState);
  const checkForUpdate = useUpdateStore((s) => s.checkForUpdate);

  useEffect(() => {
    bootstrap();
    syncFullscreenState();
    checkForUpdate();
  }, [bootstrap, syncFullscreenState, checkForUpdate]);

  useEffect(() => {
    if (status === "signed-in") {
      initializePlayer();
    }
  }, [status, initializePlayer]);

  useKeyboardShortcuts();
  usePlaybackPolling();

  if (status === "checking") {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center bg-aurora-bg">
        <UpdateBanner />
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <UpdateBanner />
      {status === "signed-in" ? <AppShell /> : <LoginView />}
    </div>
  );
}
