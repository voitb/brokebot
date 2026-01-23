import { useTheme } from "@/app/providers/theme-provider";
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
  syntaxStyle: { [key: string]: React.CSSProperties };
}

export function useCodeHighlighting({
  className,
  children,
}: UseCodeHighlightingProps): UseCodeHighlightingReturn {
  const { theme } = useTheme();

  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");
  const isInline = !match;
  const syntaxStyle = theme === "dark" ? oneDark : oneLight;

  return { language, code, isInline, syntaxStyle };
}
