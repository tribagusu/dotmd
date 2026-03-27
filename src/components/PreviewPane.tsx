import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface PreviewPaneProps {
  content: string;
}

const components: Components = {
  code({ className, children, ...props }) {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return <code {...props}>{children}</code>;
  },
};

const plugins = [remarkGfm];

export default function PreviewPane({ content }: PreviewPaneProps) {
  const debouncedContent = useDebouncedValue(content, 150);
  const memoizedPlugins = useMemo(() => plugins, []);

  return (
    <div className="preview-pane">
      <ReactMarkdown remarkPlugins={memoizedPlugins} components={components}>
        {debouncedContent}
      </ReactMarkdown>
    </div>
  );
}
