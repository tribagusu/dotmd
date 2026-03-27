import { useState, useCallback, useEffect } from "react";
import { clamp } from "../utils/clamp";

const DEFAULT_SIZE = 18;
const STEP = 1;
const MIN = 10;
const MAX = 28;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);

  useEffect(() => {
    document.documentElement.style.setProperty("--editor-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--preview-font-size", `${fontSize}px`);
  }, [fontSize]);

  const zoomIn = useCallback(() => {
    setFontSize((s) => clamp(s + STEP, MIN, MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setFontSize((s) => clamp(s - STEP, MIN, MAX));
  }, []);

  const resetZoom = useCallback(() => {
    setFontSize(DEFAULT_SIZE);
  }, []);

  return { fontSize, zoomIn, zoomOut, resetZoom };
}
