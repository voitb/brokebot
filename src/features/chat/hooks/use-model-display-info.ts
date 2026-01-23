import { useModel } from "@/app/providers/model-provider";

export interface ModelDisplayInfo {
  name: string;
  modelType: "Online" | "Local" | "None";
  supportsImages: boolean;
  specialization?: string;
}

export interface UseModelDisplayInfoReturn {
  currentModelName: string | undefined;
  isModelReady: boolean;
  isModelError: boolean;
  isModelLoading: boolean;
  modelStatus: string;
  modelDisplayInfo: ModelDisplayInfo;
}

export function useModelDisplayInfo(): UseModelDisplayInfoReturn {
  const { currentModel, isModelLoading, modelStatus } = useModel();

  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;

  const modelDisplayInfo: ModelDisplayInfo = currentModel
    ? {
        name: currentModel.name,
        modelType: currentModel.type === "online" ? "Online" : "Local",
        supportsImages: false,
        specialization:
          currentModel.localModel?.specialization ||
          currentModel.onlineModel?.category,
      }
    : {
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      };

  return {
    currentModelName: currentModel?.name,
    isModelReady,
    isModelError,
    isModelLoading,
    modelStatus,
    modelDisplayInfo,
  };
}
