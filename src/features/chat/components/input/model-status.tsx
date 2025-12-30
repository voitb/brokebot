import { Loader2, AlertCircle } from "lucide-react";
import { SimpleModelSelector } from "../simple-model-selector/simple-model-selector";
import {
  getModelStatusKey,
  getStatusColor,
  getDisplayedStatus,
} from "@/features/chat/utils/model-status-utils";

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

export function ModelStatus({
  selectedModel,
  isEngineLoading,
  isModelError,
  isModelReady,
  supportsImages,
  disabled = false,
}: ModelStatusProps) {
  const statusKey = getModelStatusKey({ isModelError, isEngineLoading, isModelReady });
  const statusColor = getStatusColor(statusKey);
  const displayedStatus = getDisplayedStatus(statusKey);

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
}
