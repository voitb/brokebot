import { useMemo } from "react";
import { useTheme } from "../../../../providers/ThemeProvider";
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

/**
 * Custom hook for code highlighting configuration
 */
export const useCodeHighlighting = ({
  className,
  children,
}: UseCodeHighlightingProps): UseCodeHighlightingReturn => {
  const { theme } = useTheme();

  const highlightingConfig = useMemo(() => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");
    const isInline = !match;
    const syntaxStyle = theme === "dark" ? oneDark : oneLight;

    return {
      language,
      code,
      isInline,
      syntaxStyle,
    };
  }, [className, children, theme]);

  return highlightingConfig;
}; 