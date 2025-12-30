import type { TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";

export const STATUS_TOOLTIP: Record<TranscriberStatus, string> = {
  recording: "Stop recording",
  processing: "Processing audio...",
  loading: "Loading model...",
  ready: "Start voice input",
  uninitialized: "Start voice input",
  error: "Start voice input",
};

export type IconType = "mic" | "mic-off" | "loader";

export interface IconConfig {
  type: IconType;
  className: string;
}

export const STATUS_ICON: Record<TranscriberStatus, IconConfig> = {
  recording: { type: "mic-off", className: "h-4 w-4 text-destructive" },
  processing: { type: "loader", className: "h-4 w-4 animate-spin" },
  loading: { type: "loader", className: "h-4 w-4 animate-spin" },
  ready: { type: "mic", className: "h-4 w-4" },
  uninitialized: { type: "mic", className: "h-4 w-4" },
  error: { type: "mic", className: "h-4 w-4" },
};

export function getTooltipText(status: TranscriberStatus): string {
  return STATUS_TOOLTIP[status];
}

export function getIconConfig(status: TranscriberStatus): IconConfig {
  return STATUS_ICON[status];
}

export function isSpeechButtonDisabled(
  status: TranscriberStatus,
  disabled?: boolean
): boolean {
  return disabled || status === "processing" || status === "loading";
}

export function isRecordingActive(status: TranscriberStatus): boolean {
  return status === "recording";
}
