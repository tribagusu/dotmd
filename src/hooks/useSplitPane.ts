import { useState, useCallback, useRef } from "react";

const STORAGE_KEY = "dotmd-split";
const DEFAULT_SPLIT = 50; // percentage for editor pane
const MIN_SPLIT = 20;
const MAX_SPLIT = 80;

function clamp(v: number) {
  return Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, v));
}

export function useSplitPane() {
  const [split, setSplit] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val)) return clamp(val);
    }
    return DEFAULT_SPLIT;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      const clamped = clamp(pct);
      setSplit(clamped);
    };

    const onMouseUp = () => {
      dragging.current = false;
      // Persist on release
      setSplit((current) => {
        localStorage.setItem(STORAGE_KEY, String(current));
        return current;
      });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const resetSplit = useCallback(() => {
    setSplit(DEFAULT_SPLIT);
    localStorage.setItem(STORAGE_KEY, String(DEFAULT_SPLIT));
  }, []);

  return { split, containerRef, onMouseDown, resetSplit };
}
