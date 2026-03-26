import { useEffect } from "react";

interface ShortcutActions {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function useKeyboardShortcuts({
  onOpen,
  onSave,
  onSaveAs,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "o") {
        e.preventDefault();
        onOpen();
      } else if (e.metaKey && e.shiftKey && e.key === "s") {
        e.preventDefault();
        onSaveAs();
      } else if (e.metaKey && e.key === "s") {
        e.preventDefault();
        onSave();
      } else if (e.metaKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        onZoomIn();
      } else if (e.metaKey && e.key === "-") {
        e.preventDefault();
        onZoomOut();
      } else if (e.metaKey && e.key === "0") {
        e.preventDefault();
        onResetZoom();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen, onSave, onSaveAs, onZoomIn, onZoomOut, onResetZoom]);
}
