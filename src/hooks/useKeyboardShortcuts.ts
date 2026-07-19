import { useEffect } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";

/**
 * In-app keyboard shortcuts (active while Aurora has focus):
 *  Space        Play / Pause
 *  Right Arrow  Next track
 *  Left Arrow   Previous track
 *  F / F11      Toggle fullscreen
 *  Escape       Exit fullscreen
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          usePlayerStore.getState().togglePlay();
          break;
        case "ArrowRight":
          usePlayerStore.getState().next();
          break;
        case "ArrowLeft":
          usePlayerStore.getState().previous();
          break;
        case "f":
        case "F11":
          e.preventDefault();
          useUiStore.getState().toggleFullscreen();
          break;
        case "Escape":
          if (useUiStore.getState().isFullscreen) {
            useUiStore.getState().toggleFullscreen();
          }
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
