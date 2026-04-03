import { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "./components/Toolbar";
import EditorPane from "./components/EditorPane";
import PreviewPane from "./components/PreviewPane";
import SaveToast from "./components/SaveToast";
import { useFileOperations } from "./hooks/useFileOperations";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useFontSize } from "./hooks/useFontSize";
import { useTheme } from "./hooks/useTheme";
import { useSplitPane } from "./hooks/useSplitPane";
import { isValidMarkdownPath } from "./utils/validation";

const isTauri = "__TAURI_INTERNALS__" in window;

function App() {
  const {
    filePath,
    content,
    setContent,
    isLoading,
    openFile,
    saveFile,
    saveFileAs,
    loadFileFromPath,
  } = useFileOperations();

  const { zoomIn, zoomOut, resetZoom } = useFontSize();
  const { mode, isDark, cycleTheme } = useTheme();
  const { split, resetSplit, containerRef, onMouseDown, onDividerDoubleClick } = useSplitPane();

  // Editor starts visible (no file) or hidden (file loaded)
  const [editorVisible, setEditorVisible] = useState(true);

  const toggleEditor = useCallback(() => {
    setEditorVisible((prev) => {
      if (!prev) resetSplit();
      return !prev;
    });
  }, [resetSplit]);

  // When a file is loaded, hide the editor (preview-only mode)
  useEffect(() => {
    if (filePath) {
      setEditorVisible(false);
    }
  }, [filePath]);

  const [showSaveToast, setShowSaveToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  const handleSave = useCallback(async () => {
    const success = await saveFile();
    if (success) {
      clearTimeout(toastTimerRef.current);
      setShowSaveToast(true);
      toastTimerRef.current = setTimeout(() => setShowSaveToast(false), 1000);
    }
  }, [saveFile]);

  const handleSaveAs = useCallback(async () => {
    const success = await saveFileAs();
    if (success) {
      clearTimeout(toastTimerRef.current);
      setShowSaveToast(true);
      toastTimerRef.current = setTimeout(() => setShowSaveToast(false), 1000);
    }
  }, [saveFileAs]);

  useKeyboardShortcuts({
    onOpen: openFile,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetZoom,
    onToggleEditor: toggleEditor,
  });

  // On mount, check if a file was passed via Finder before the frontend was ready
  useEffect(() => {
    if (!isTauri) return;
    import("@tauri-apps/api/core")
      .then(({ invoke }) =>
        invoke<string | null>("get_initial_file").then((path) => {
          if (path && isValidMarkdownPath(path)) loadFileFromPath(path);
        }),
      )
      .catch((err) => console.error("Failed to get initial file:", err));
  }, [loadFileFromPath]);

  // Listen for files opened from Finder while the app is already running
  useEffect(() => {
    if (!isTauri) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/event")
      .then(({ listen }) =>
        listen<string>("file-opened", (event) => {
          if (isValidMarkdownPath(event.payload)) {
            loadFileFromPath(event.payload);
          }
        }).then((fn) => {
          unlisten = fn;
        }),
      )
      .catch((err) => console.error("Failed to listen for file-opened:", err));
    return () => {
      unlisten?.();
    };
  }, [loadFileFromPath]);

  // Update window title
  useEffect(() => {
    if (!isTauri) return;
    const filename = filePath ? filePath.replace(/\\/g, "/").split("/").pop() : "Untitled";
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        getCurrentWindow().setTitle(`${filename} — DotMD`);
      })
      .catch((err) => console.error("Failed to set window title:", err));
  }, [filePath]);

  return (
    <div className="app-container">
      <SaveToast visible={showSaveToast} />
      {isLoading && (
        <div className="loading-overlay" role="status" aria-label="Loading">
          <div className="loading-spinner" />
        </div>
      )}
      <Toolbar
        filePath={filePath}
        content={content}
        themeMode={mode}
        editorVisible={editorVisible}
        onCycleTheme={cycleTheme}
        onToggleEditor={toggleEditor}
      />
      <div className="main-content" ref={containerRef}>
        {editorVisible && (
          <>
            <div style={{ width: `${split}%`, height: "100%", overflow: "hidden" }}>
              <EditorPane content={content} onChange={setContent} isDark={isDark} />
            </div>
            <div
              className="split-divider"
              onMouseDown={onMouseDown}
              onDoubleClick={onDividerDoubleClick}
            />
          </>
        )}
        <div style={{ width: editorVisible ? `${100 - split}%` : "100%", height: "100%" }}>
          <PreviewPane content={content} />
        </div>
      </div>
    </div>
  );
}

export default App;
