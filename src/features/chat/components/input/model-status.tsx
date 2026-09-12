import { Loader2, AlertCircle } from "lucide-react";
import { ModelSelectorDropdown } from "../model-selector-dropdown/model-selector-dropdown";

type ModelStatusKey = "error" | "loading" | "ready" | "initializing";

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

function getModelStatusKey(flags: {
  isModelError: boolean;
  isEngineLoading: boolean;
  isModelReady: boolean;
}): ModelStatusKey {
  if (flags.isModelError) return "error";
  if (flags.isEngineLoading) return "loading";
  if (flags.isModelReady) return "ready";
  return "initializing";
}

interface ModelStatusProps {
  selectedModel: { specialization?: string };
  isEngineLoading: boolean;
  isModelError: boolean;
  isModelReady: boolean;
  supportsImages: boolean;
  disabled?: boolean;
}

export function ModelStatus({
  selectedModel,
  isEngineLoading,
  isModelError,
  isModelReady,
  supportsImages,
  disabled = false,
}: ModelStatusProps) {
  const statusKey = getModelStatusKey({ isModelError, isEngineLoading, isModelReady });

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <ModelSelectorDropdown disabled={disabled} />

        <div className="flex items-center gap-1">
          {isEngineLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          {isModelError && <AlertCircle className="w-3 h-3 text-destructive" />}
          <span role="status" aria-live="polite" className={STATUS_COLORS[statusKey]}>
            {STATUS_TEXT[statusKey]}
          </span>
        </div>

        {supportsImages && isModelReady && (
          <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
            Vision
          </span>
        )}
        {selectedModel.specialization && isModelReady && (
          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs capitalize">
            {selectedModel.specialization}
          </span>
        )}
      </div>
    </div>
  );
}
