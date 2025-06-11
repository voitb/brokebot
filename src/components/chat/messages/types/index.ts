/**
 * Parsed message content with thinking and main content
 */
export interface ParsedMessage {
  thinking: string;
  content: string;
}

/**
 * Message bubble position types
 */
export type MessagePosition = "left" | "right";

/**
 * Message content type for rendering
 */
export type MessageContentType = "user" | "ai";

/**
 * Copy-to-clipboard hook return type
 */
export interface CopyToClipboardResult {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Code highlighting configuration
 */
export interface CodeHighlightingConfig {
  language: string;
  code: string;
  isInline: boolean;
  syntaxStyle: { [key: string]: React.CSSProperties };
}

/**
 * Generation warning configuration
 */
export interface GenerationWarningConfig {
  showSlowWarning: boolean;
} 