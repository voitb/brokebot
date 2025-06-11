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
  status: string;
  isEngineLoading: boolean;
  isModelError: boolean;
  isModelReady: boolean;
  supportsImages: boolean;
  disabled?: boolean;
  messageLength: number;
}

/**
 * Model status and selector component
 */
export const ModelStatus: React.FC<ModelStatusProps> = ({
  selectedModel,
  status,
  isEngineLoading,
  isModelError,
  isModelReady,
  supportsImages,
  disabled = false,
  messageLength,
}) => {
  const getStatusMessage = () => {
    if (isModelError) {
      return "Model failed to load";
    }
    if (isEngineLoading) {
      return `Loading ${selectedModel.name}...`;
    }
    if (isModelReady) {
      return "Ready";
    }
    return status;
  };

  const getStatusColor = () => {
    if (isModelError) return "text-destructive";
    if (isEngineLoading) return "text-amber-600 dark:text-amber-400";
    if (isModelReady) return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <SimpleModelSelector disabled={disabled} />

        {/* Model Status */}
        <div className="flex items-center gap-1">
          {isEngineLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          {isModelError && <AlertCircle className="w-3 h-3 text-destructive" />}
          <span className={getStatusColor()}>{getStatusMessage()}</span>
        </div>

        {supportsImages && isModelReady && (
          <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
            Vision
          </span>
        )}
        {(selectedModel.specialization ?? false) && isModelReady && (
          <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs capitalize">
            {selectedModel.specialization}
          </span>
        )}
      </div>
      <span>{messageLength}/4000</span>
    </div>
  );
};
