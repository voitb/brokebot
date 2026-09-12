import { useRootTheme } from "@/hooks/use-root-theme";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface UseCodeHighlightingProps {
  className?: string;
  children: React.ReactNode;
}

interface UseCodeHighlightingReturn {
  language: string;
  code: string;
  isInline: boolean;
  syntaxStyle: Record<string, React.CSSProperties>;
}

export function useCodeHighlighting({
  className,
  children,
}: UseCodeHighlightingProps): UseCodeHighlightingReturn {
  const isDarkTheme = useRootTheme() === "dark";

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");
  const hasLanguage = Boolean(match);
  const isMultiline = code.includes("\n");
  const isInline = !hasLanguage && !isMultiline;

  const syntaxStyle = isDarkTheme ? oneDark : oneLight;

  return { language, code, isInline, syntaxStyle };
}
