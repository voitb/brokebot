import { useState } from "react";
import { toast } from "sonner";
import { useWebLLM, type ModelInfo } from "@/app/providers/web-llm-provider";
import {
  useModel,
  createLocalModel,
  createOnlineModel,
} from "@/app/providers/model-provider";
import type { OpenRouterModel } from "@/features/chat/lib/openrouter";
import { useUserConfig } from "@/shared/hooks/use-user-config";
import { getDisplayName } from "@/features/chat/utils/model-selector-utils";

export interface UseModelSelectorDropdownReturn {
  // State
  isDropdownOpen: boolean;
  isDialogOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived
  isOnlineModel: boolean;
  displayName: string;
  isOpenRouterKeyAvailable: boolean;
  currentModel: ReturnType<typeof useModel>["currentModel"];
  availableModels: ModelInfo[];
  activeLocalModel: ModelInfo;

  // Handlers
  handleLocalModelSelect: (model: ModelInfo) => void;
  handleOnlineModelSelect: (model: OpenRouterModel, apiKey: string) => void;
  handleDialogTrigger: () => void;
}

export function useModelSelectorDropdown(): UseModelSelectorDropdownReturn {
  const { selectedModel, availableModels } = useWebLLM();
  const { currentModel, setCurrentModel } = useModel();
  const { config } = useUserConfig();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Derived values
  const isOnlineModel = currentModel?.type === "online";
  const displayName = getDisplayName({ currentModel, activeLocalModel: selectedModel });
  const isOpenRouterKeyAvailable = !!config?.openrouterApiKey;

  // Handlers
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
    // State
    isDropdownOpen,
    isDialogOpen,
    setIsDropdownOpen,
    setIsDialogOpen,

    // Derived
    isOnlineModel,
    displayName,
    isOpenRouterKeyAvailable,
    currentModel,
    availableModels: [...availableModels],
    activeLocalModel: selectedModel,

    // Handlers
    handleLocalModelSelect,
    handleOnlineModelSelect,
    handleDialogTrigger,
  };
}
