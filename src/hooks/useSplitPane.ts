import { useState, useCallback, useRef, useEffect } from "react";
import { clamp } from "../utils/clamp";

const DEFAULT_SPLIT = 50;
const MIN_SPLIT = 20;
const MAX_SPLIT = 80;

export function useSplitPane() {
  const [split, setSplit] = useState<number>(DEFAULT_SPLIT);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Store refs for event handlers so we can clean up properly
  const handlersRef = useRef<{
    onMouseMove: ((ev: MouseEvent) => void) | null;
    onMouseUp: (() => void) | null;
  }>({ onMouseMove: null, onMouseUp: null });

  const resetSplit = useCallback(() => {
    setSplit(DEFAULT_SPLIT);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplit(clamp(pct, MIN_SPLIT, MAX_SPLIT));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handlersRef.current = { onMouseMove: null, onMouseUp: null };
    };

    handlersRef.current = { onMouseMove, onMouseUp };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  // Cleanup on unmount (#18)
  useEffect(() => {
    return () => {
      const { onMouseMove, onMouseUp } = handlersRef.current;
      if (onMouseMove) document.removeEventListener("mousemove", onMouseMove);
      if (onMouseUp) document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  return { split, resetSplit, containerRef, onMouseDown };
}
