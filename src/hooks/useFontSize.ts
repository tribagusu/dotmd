import { useState, useCallback, useEffect } from "react";

const EDITOR_DEFAULT = 18;
const PREVIEW_DEFAULT = 18;
const STEP = 1;
const MIN = 10;
const MAX = 28;

function clamp(v: number) {
  return Math.min(MAX, Math.max(MIN, v));
}

export function useFontSize() {
  const [editorSize, setEditorSize] = useState(EDITOR_DEFAULT);
  const [previewSize, setPreviewSize] = useState(PREVIEW_DEFAULT);

  // Apply CSS variables to the document
  useEffect(() => {
    document.documentElement.style.setProperty("--editor-font-size", `${editorSize}px`);
    document.documentElement.style.setProperty("--preview-font-size", `${previewSize}px`);
  }, [editorSize, previewSize]);

  const zoomIn = useCallback(() => {
    setEditorSize((s) => clamp(s + STEP));
    setPreviewSize((s) => clamp(s + STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setEditorSize((s) => clamp(s - STEP));
    setPreviewSize((s) => clamp(s - STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setEditorSize(EDITOR_DEFAULT);
    setPreviewSize(PREVIEW_DEFAULT);
  }, []);

  return { editorSize, previewSize, zoomIn, zoomOut, resetZoom };
}
