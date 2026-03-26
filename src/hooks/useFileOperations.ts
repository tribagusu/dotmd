import { useState, useCallback } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";

export function useFileOperations() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const isDirty = content !== savedContent;

  const loadFileFromPath = useCallback(async (path: string) => {
    const text = await readTextFile(path);
    setContent(text);
    setSavedContent(text);
    setFilePath(path);
  }, []);

  const openFile = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    });
    if (selected) {
      await loadFileFromPath(selected as string);
    }
  }, [loadFileFromPath]);

  const saveFile = useCallback(async () => {
    if (filePath) {
      await writeTextFile(filePath, content);
      setSavedContent(content);
    } else {
      // No existing path — trigger Save As
      const path = await save({
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      });
      if (path) {
        await writeTextFile(path, content);
        setSavedContent(content);
        setFilePath(path);
      }
    }
  }, [filePath, content]);

  const saveFileAs = useCallback(async () => {
    const path = await save({
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    });
    if (path) {
      await writeTextFile(path, content);
      setSavedContent(content);
      setFilePath(path);
    }
  }, [content]);

  return {
    filePath,
    content,
    savedContent,
    isDirty,
    setContent,
    openFile,
    saveFile,
    saveFileAs,
    loadFileFromPath,
  };
}
