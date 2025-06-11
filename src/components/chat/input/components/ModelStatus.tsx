import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { SimpleModelSelector } from "../../SimpleModelSelector";

interface ModelStatusProps {
  selectedModel: {
    name: string;
    modelType: string;
    supportsImages?: boolean;
    specialization?: string;
  };
  isEngineLoading: boolean;
  isModelError: boolean;
  isModelReady: boolean;
  supportsImages: boolean;
  disabled?: boolean;
}

/**
 * Model status and selector component
 */
export const ModelStatus: React.FC<ModelStatusProps> = ({
  selectedModel,
  isEngineLoading,
  isModelError,
  isModelReady,
  supportsImages,
  disabled = false,
}) => {
  const statusColor = isModelError
    ? "text-destructive"
    : isEngineLoading
    ? "text-amber-600 dark:text-amber-400"
    : isModelReady
    ? "text-green-600 dark:text-green-400"
    : "text-muted-foreground";

  const displayedStatus = isModelError
    ? "Error"
    : isEngineLoading
    ? "Loading Model..."
    : isModelReady
    ? "Ready"
    : "Initializing...";

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <SimpleModelSelector disabled={disabled} />

        {/* Model Status */}
        <div className="flex items-center gap-1">
          {isEngineLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          {isModelError && <AlertCircle className="w-3 h-3 text-destructive" />}
          <span className={statusColor}>{displayedStatus}</span>
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
};
