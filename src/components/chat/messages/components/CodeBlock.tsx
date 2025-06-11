import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyButton } from "../../../ui";
import { useCodeHighlighting } from "../hooks";

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Inline code component for short code snippets
 */
const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
    {children}
  </code>
);

/**
 * Code block header with language and copy button
 */
interface CodeBlockHeaderProps {
  language: string;
  code: string;
}

const CodeBlockHeader: React.FC<CodeBlockHeaderProps> = ({
  language,
  code,
}) => (
  <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-t-lg border">
    <span className="text-xs font-medium text-muted-foreground uppercase">
      {language}
    </span>
    <CopyButton
      value={code}
      size="sm"
      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </div>
);

/**
 * Code block component with syntax highlighting and copy functionality
 */
export const CodeBlock: React.FC<CodeBlockProps> = React.memo(
  ({ className, children }) => {
    const { language, code, isInline, syntaxStyle } = useCodeHighlighting({
      className,
      children,
    });

    if (isInline) {
      return <InlineCode>{children}</InlineCode>;
    }

    return (
      <div className="relative group">
        <CodeBlockHeader language={language} code={code} />
        <SyntaxHighlighter
          style={syntaxStyle}
          language={language}
          PreTag="div"
          wrapLines={false}
          className="!m-0 !rounded-t-none !border-t-0"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }
);
