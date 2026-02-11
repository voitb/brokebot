import { useState } from "react";
import { toast } from "sonner";
import { useWebLLM, type ModelInfo } from "@/app/providers/web-llm-provider";
import {
  useModel,
  createLocalModel,
  createOnlineModel,
} from "@/app/providers/model-provider";
import type { OpenRouterModel } from "@/features/chat/api/openrouter";
import { useUserConfig } from "@/hooks/use-user-config";

export interface UseModelSelectorDropdownReturn {
  isDropdownOpen: boolean;
  isDialogOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOnlineModel: boolean;
  displayName: string;
  isOpenRouterKeyAvailable: boolean;
  currentModel: ReturnType<typeof useModel>["currentModel"];
  availableModels: ModelInfo[];
  activeLocalModel: ModelInfo | null;
  isLoadingModels: boolean;
  handleLocalModelSelect: (model: ModelInfo) => void;
  handleOnlineModelSelect: (model: OpenRouterModel, apiKey: string) => void;
  handleDialogTrigger: () => void;
  loadLocalModels: () => Promise<void>;
}

export function useModelSelectorDropdown(): UseModelSelectorDropdownReturn {
  const { selectedModel, availableModels, isLoadingModels, loadAvailableModels } = useWebLLM();
  const { currentModel, setCurrentModel } = useModel();
  const { config } = useUserConfig();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isOnlineModel = currentModel?.type === "online";
  const displayName = !currentModel
    ? "Select Model"
    : currentModel.type === "online"
      ? currentModel.onlineModel?.name ?? "Online Model"
      : selectedModel?.name ?? currentModel.name;
  const isOpenRouterKeyAvailable = !!config?.openrouterApiKey;

  const loadLocalModels = async () => {
    await loadAvailableModels();
  };

  const handleLocalModelSelect = (model: ModelInfo) => {
    const localModel = createLocalModel(model);
    setCurrentModel(localModel);
    setIsDropdownOpen(false);
  };

  const handleOnlineModelSelect = (model: OpenRouterModel, apiKey: string) => {
    if (!apiKey) {
      toast.error("OpenRouter API key is required");
      return;
    }

    const onlineModel = createOnlineModel(model, apiKey);
    setCurrentModel(onlineModel);
  };

  const handleDialogTrigger = () => {
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  };

  return {
    isDropdownOpen,
    isDialogOpen,
    setIsDropdownOpen,
    setIsDialogOpen,
    isOnlineModel,
    displayName,
    isOpenRouterKeyAvailable,
    currentModel,
    availableModels: [...availableModels],
    activeLocalModel: selectedModel,
    isLoadingModels,
    handleLocalModelSelect,
    handleOnlineModelSelect,
    handleDialogTrigger,
    loadLocalModels,
  };
}
