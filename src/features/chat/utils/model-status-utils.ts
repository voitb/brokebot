export type ModelStatusKey = "error" | "loading" | "ready" | "initializing";

export interface ModelStatusFlags {
  isModelError: boolean;
  isEngineLoading: boolean;
  isModelReady: boolean;
}

const STATUS_COLORS: Record<ModelStatusKey, string> = {
  error: "text-destructive",
  loading: "text-amber-600 dark:text-amber-400",
  ready: "text-green-600 dark:text-green-400",
  initializing: "text-muted-foreground",
};

const STATUS_TEXT: Record<ModelStatusKey, string> = {
  error: "Error",
  loading: "Loading Model...",
  ready: "Ready",
  initializing: "Initializing...",
};

export function getModelStatusKey(flags: ModelStatusFlags): ModelStatusKey {
  if (flags.isModelError) return "error";
  if (flags.isEngineLoading) return "loading";
  if (flags.isModelReady) return "ready";
  return "initializing";
}

export function getStatusColor(key: ModelStatusKey): string {
  return STATUS_COLORS[key];
}

export function getDisplayedStatus(key: ModelStatusKey): string {
  return STATUS_TEXT[key];
}
