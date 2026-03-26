import { useState, useCallback } from "react";
import type { ThemeMode } from "../hooks/useTheme";

interface ToolbarProps {
  filePath: string | null;
  content: string;
  themeMode: ThemeMode;
  onCycleTheme: () => void;
}

// SVG icons for each theme mode
function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    // Sun icon
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="8" cy="8" r="3" />
        <line x1="8" y1="1.5" x2="8" y2="3" />
        <line x1="8" y1="13" x2="8" y2="14.5" />
        <line x1="1.5" y1="8" x2="3" y2="8" />
        <line x1="13" y1="8" x2="14.5" y2="8" />
        <line x1="3.4" y1="3.4" x2="4.5" y2="4.5" />
        <line x1="11.5" y1="11.5" x2="12.6" y2="12.6" />
        <line x1="3.4" y1="12.6" x2="4.5" y2="11.5" />
        <line x1="11.5" y1="4.5" x2="12.6" y2="3.4" />
      </svg>
    );
  }
  if (mode === "dark") {
    // Moon icon
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M13.5 9.5a5.5 5.5 0 0 1-7-7 5.5 5.5 0 1 0 7 7z" />
      </svg>
    );
  }
  // System icon (monitor)
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="2" width="12" height="9" rx="1.5" />
      <line x1="5.5" y1="14" x2="10.5" y2="14" />
      <line x1="8" y1="11" x2="8" y2="14" />
    </svg>
  );
}

const modeLabels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export default function Toolbar({ filePath, content, themeMode, onCycleTheme }: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const filename = filePath ? filePath.split("/").pop() : null;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div className="toolbar" data-tauri-drag-region>
      <div className="toolbar-spacer" />
      <span className="toolbar-filename">{filename || "Untitled"}</span>
      <div className="toolbar-spacer" />
      <div className="toolbar-actions">
        <button
          className="toolbar-btn"
          onClick={onCycleTheme}
          title={`Theme: ${modeLabels[themeMode]}`}
        >
          <ThemeIcon mode={themeMode} />
        </button>
        <button className="toolbar-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M3 11V3a1.5 1.5 0 0 1 1.5-1.5H11" />
              </svg>
              COPY
            </>
          )}
        </button>
        <button className="toolbar-menu-btn" aria-label="Menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.2" />
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="8" cy="13" r="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
