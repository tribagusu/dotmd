import { useMemo } from "react";
import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

const baseTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--bg-editor)",
    color: "var(--text-primary)",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--bg-editor)",
    color: "var(--text-muted)",
    border: "none",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--text-primary)",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(128, 128, 128, 0.2) !important",
  },
});

// Light mode syntax colors
const lightHighlighting = HighlightStyle.define([
  { tag: tags.heading1, color: "#2980b9", fontWeight: "700" },
  { tag: tags.heading2, color: "#2980b9", fontWeight: "700" },
  { tag: tags.heading3, color: "#2980b9", fontWeight: "600" },
  { tag: tags.heading4, color: "#2980b9", fontWeight: "600" },
  { tag: tags.heading5, color: "#2980b9", fontWeight: "600" },
  { tag: tags.heading6, color: "#2980b9", fontWeight: "600" },
  { tag: tags.processingInstruction, color: "#2980b9" },
  { tag: tags.strong, color: "#b8860b", fontWeight: "700" },
  { tag: tags.emphasis, color: "#6a5acd", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#888", textDecoration: "line-through" },
  { tag: tags.link, color: "#2980b9" },
  { tag: tags.url, color: "#7ba0b8" },
  {
    tag: tags.monospace,
    color: "#8b5e34",
    backgroundColor: "rgba(255, 243, 224, 0.6)",
    borderRadius: "3px",
  },
  { tag: tags.quote, color: "#888" },
  { tag: tags.list, color: "#b8860b" },
  { tag: tags.meta, color: "#999" },
  { tag: tags.content, color: "#1a1a1a" },
]);

// Dark mode syntax colors
const darkHighlighting = HighlightStyle.define([
  { tag: tags.heading1, color: "#6cb6ff", fontWeight: "700" },
  { tag: tags.heading2, color: "#6cb6ff", fontWeight: "700" },
  { tag: tags.heading3, color: "#6cb6ff", fontWeight: "600" },
  { tag: tags.heading4, color: "#6cb6ff", fontWeight: "600" },
  { tag: tags.heading5, color: "#6cb6ff", fontWeight: "600" },
  { tag: tags.heading6, color: "#6cb6ff", fontWeight: "600" },
  { tag: tags.processingInstruction, color: "#6cb6ff" },
  { tag: tags.strong, color: "#6cb6ff", fontWeight: "700" },
  { tag: tags.emphasis, color: "#b09de0", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#777", textDecoration: "line-through" },
  { tag: tags.link, color: "#7bb8d0" },
  { tag: tags.url, color: "#5a8a9e" },
  {
    tag: tags.monospace,
    color: "#e0c9a6",
    backgroundColor: "rgba(61, 53, 40, 0.6)",
    borderRadius: "3px",
  },
  { tag: tags.quote, color: "#999" },
  { tag: tags.list, color: "#d4a06a" },
  { tag: tags.meta, color: "#6cb6ff" },
  { tag: tags.content, color: "#d4d4d4" },
]);

function buildExtensions(isDark: boolean): Extension[] {
  const highlighting = isDark ? darkHighlighting : lightHighlighting;
  return [markdown(), baseTheme, EditorView.lineWrapping, syntaxHighlighting(highlighting)];
}

export default function EditorPane({ content, onChange, isDark }: EditorPaneProps) {
  const extensions = useMemo(() => buildExtensions(isDark), [isDark]);

  const theme = useMemo(
    (): Extension =>
      EditorView.theme(
        {
          "&": {
            backgroundColor: "var(--bg-editor)",
            color: "var(--text-primary)",
          },
        },
        { dark: isDark },
      ),
    [isDark],
  );

  return (
    <div className="editor-pane">
      <CodeMirror
        value={content}
        onChange={onChange}
        theme={theme}
        extensions={extensions}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          crosshairCursor: false,
          rectangularSelection: false,
          defaultKeymap: true,
          syntaxHighlighting: false,
          searchKeymap: false,
          lintKeymap: false,
        }}
        style={{ height: "100%" }}
      />
    </div>
  );
}
