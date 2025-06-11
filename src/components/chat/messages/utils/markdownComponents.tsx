import React from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "../components/CodeBlock";
import { ScrollArea } from "../../../ui/scroll-area";

/**
 * Creates markdown components configuration for ReactMarkdown
 */
export const createMarkdownComponents = (): Components => ({
  code: ({ className, children, ...props }) => (
    <CodeBlock className={className} {...props}>
      {children}
    </CodeBlock>
  ),
  pre: ({ children }) => <ScrollArea className="w-full">{children}</ScrollArea>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-border pl-4 italic mb-2 last:mb-0">
      {children}
    </blockquote>
  ),
});
