import { type CSSProperties, type ReactNode, lazy, Suspense } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCodeHighlighting } from "./use-code-highlighting";

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((m) => ({
    default: m.Prism,
  }))
);

const CODE_BLOCK_STYLE: CSSProperties = {
  margin: 0,
  padding: "1rem",
  borderRadius: 0,
  border: "none",
  whiteSpace: "pre",
  minWidth: "100%",
  width: "max-content",
};

interface CodeBlockProps {
  className?: string;
  children: ReactNode;
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  );
}

interface CodeBlockHeaderProps {
  language: string;
  code: string;
}

function CodeBlockHeader({ language, code }: CodeBlockHeaderProps) {
  return (
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
}

export function CodeBlock({ className, children }: CodeBlockProps) {
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
      <div className="flex">
        <ScrollArea
          className="w-1 flex-1 rounded-b-lg border"
        >
          <Suspense fallback={<pre><code>{code}</code></pre>}>
            <SyntaxHighlighter
              style={syntaxStyle}
              language={language}
              PreTag="div"
              wrapLines={false}
              className="!m-0 !rounded-none !border-0"
              customStyle={CODE_BLOCK_STYLE}
            >
              {code}
            </SyntaxHighlighter>
          </Suspense>
          <ScrollBar orientation="horizontal" className="w-full" />
        </ScrollArea>
      </div>
    </div>
  );
}
