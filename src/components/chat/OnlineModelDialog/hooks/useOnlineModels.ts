import { toast } from "sonner";
import { OpenRouterClient, type OpenRouterModel } from "../../../../lib/openrouter";
import { useUserConfig } from "@/hooks/useUserConfig";
import { useModels } from "../../../../hooks/api/useModels";

export const useOnlineModels = (
  onModelSelect: (model: OpenRouterModel, client: OpenRouterClient | null) => void,
  onOpenChange?: (open: boolean) => void
) => {
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

    const client = new OpenRouterClient({
      siteUrl: window.location.origin,
      siteName: "Brokebot",
      keys: { openrouterApiKey: config.openrouterApiKey },
    });

    onModelSelect(model, client);
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
};
