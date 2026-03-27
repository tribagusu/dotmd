import { useEffect } from "react";
import Toolbar from "./components/Toolbar";
import EditorPane from "./components/EditorPane";
import PreviewPane from "./components/PreviewPane";
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
    openFile,
    saveFile,
    saveFileAs,
    loadFileFromPath,
  } = useFileOperations();

  const { zoomIn, zoomOut, resetZoom } = useFontSize();
  const { mode, isDark, cycleTheme } = useTheme();
  const { split, containerRef, onMouseDown } = useSplitPane();

  useKeyboardShortcuts({
    onOpen: openFile,
    onSave: saveFile,
    onSaveAs: saveFileAs,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetZoom,
  });

  // On mount, check if a file was passed via Finder before the frontend was ready
  useEffect(() => {
    if (!isTauri) return;
    import("@tauri-apps/api/core")
      .then(({ invoke }) =>
        invoke<string | null>("get_initial_file").then((path) => {
          if (path && isValidMarkdownPath(path)) loadFileFromPath(path);
        })
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
        })
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
      <Toolbar
        filePath={filePath}
        content={content}
        themeMode={mode}
        onCycleTheme={cycleTheme}
      />
      <div className="main-content" ref={containerRef}>
        <div style={{ width: `${split}%`, height: "100%", overflow: "hidden" }}>
          <EditorPane content={content} onChange={setContent} isDark={isDark} />
        </div>
        <div className="split-divider" onMouseDown={onMouseDown} />
        <div style={{ width: `${100 - split}%`, height: "100%" }}>
          <PreviewPane content={content} />
        </div>
      </div>
    </div>
  );
}

export default App;
