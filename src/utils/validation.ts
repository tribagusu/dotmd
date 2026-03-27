const VALID_EXTENSIONS = [".md", ".markdown"];

/**
 * Validates that a file path is an absolute path to a markdown file.
 * Prevents path traversal and non-markdown file access.
 */
export function isValidMarkdownPath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  // Must be absolute
  if (!path.startsWith("/")) return false;
  // No path traversal
  if (path.includes("..")) return false;
  // Must end with a valid markdown extension
  const lower = path.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
