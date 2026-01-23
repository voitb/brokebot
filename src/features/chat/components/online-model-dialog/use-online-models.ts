import { toast } from "sonner";
import { type OpenRouterModel } from "@/features/chat/lib/openrouter";
import { useUserConfig } from "@/hooks/use-user-config";
import { useModels } from "@/features/chat/hooks/use-models";

export interface UseOnlineModelsReturn {
  storedKeys: { openrouter: string | undefined };
  freeModels: OpenRouterModel[];
  paidModels: OpenRouterModel[];
  isLoading: boolean;
  error: Error | null;
  hasOpenRouterKey: boolean;
  hasPaidKey: boolean;
  handleModelSelect: (model: OpenRouterModel) => void;
  handleOpenChange: (isOpen: boolean) => void;
}

export function useOnlineModels(
  onModelSelect: (model: OpenRouterModel, apiKey: string) => void,
  onOpenChange?: (open: boolean) => void
): UseOnlineModelsReturn {
  const { config } = useUserConfig();
  const { models, isLoading, error } = useModels();

  const freeModels = models.filter((m) => m.isFree);
  const paidModels = models.filter((m) => !m.isFree);

  const hasOpenRouterKey = !!config?.openrouterApiKey;
  const hasPaidKey = hasOpenRouterKey;

  const handleModelSelect = (model: OpenRouterModel) => {
    if (!config?.openrouterApiKey) {
      toast.error("Please add your OpenRouter API key first in Settings.");
      return;
    }

    onModelSelect(model, config.openrouterApiKey);
    onOpenChange?.(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
  };

  return {
    storedKeys: { openrouter: config?.openrouterApiKey },
    freeModels,
    paidModels,
    isLoading,
    error,
    hasOpenRouterKey,
    hasPaidKey,
    handleModelSelect,
    handleOpenChange,
  };
}
