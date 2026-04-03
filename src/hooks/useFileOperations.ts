import { useState, useCallback } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";

export function useFileOperations() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDirty = content !== savedContent;

  const loadFileFromPath = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      const text = await readTextFile(path);
      setContent(text);
      setSavedContent(text);
      setFilePath(path);
    } catch (err) {
      console.error("Failed to read file:", path, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      });
      if (selected && typeof selected === "string") {
        await loadFileFromPath(selected);
      }
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  }, [loadFileFromPath]);

  const saveFile = useCallback(async () => {
    setIsLoading(true);
    try {
      if (filePath) {
        await writeTextFile(filePath, content);
        setSavedContent(content);
      } else {
        const path = await save({
          filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
        });
        if (path) {
          await writeTextFile(path, content);
          setSavedContent(content);
          setFilePath(path);
        }
      }
    } catch (err) {
      console.error("Failed to save file:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filePath, content]);

  const saveFileAs = useCallback(async () => {
    setIsLoading(true);
    try {
      const path = await save({
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      });
      if (path) {
        await writeTextFile(path, content);
        setSavedContent(content);
        setFilePath(path);
      }
    } catch (err) {
      console.error("Failed to save file:", err);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  return {
    filePath,
    content,
    savedContent,
    isDirty,
    isLoading,
    setContent,
    openFile,
    saveFile,
    saveFileAs,
    loadFileFromPath,
  };
}
