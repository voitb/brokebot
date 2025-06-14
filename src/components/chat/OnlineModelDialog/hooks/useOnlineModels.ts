import { useCallback } from "react";
import { toast } from "sonner";
import {
  OpenRouterClient,
  type OpenRouterModel,
} from "@/lib/openrouter";
import { functions } from "@/lib/appwriteClient";
import { useUserConfig } from "@/hooks/useUserConfig";

export const useOnlineModels = (
  open: boolean | undefined,
  onModelSelect: (
    model: OpenRouterModel,
    client: OpenRouterClient | null
  ) => void,
  onOpenChange?: (open: boolean) => void
) => {
  const { config } = useUserConfig();

  const hasOpenRouterKey = !!config?.openrouterApiKey;
  const hasPaidKey = !!(
    config?.openaiApiKey ||
    config?.googleApiKey ||
    config?.anthropicApiKey
  );

  const handleModelSelect = useCallback(
    (model: OpenRouterModel) => {
      // @ts-expect-error - `requiresApiKey` exists on paid models
      const providerKey = model.requiresApiKey ? `${model.requiresApiKey}ApiKey` : 'openrouterApiKey';
      // @ts-expect-error - `providerKey` is a valid key of config
      if (!config || !config[providerKey]) {
        toast.error(`Please add your ${model.provider} API key first in Settings -> General.`);
        return;
      }

      const client = new OpenRouterClient({
        functions,
        siteUrl: window.location.origin,
        siteName: "Local GPT",
        keys: {
          openrouterApiKey: config?.openrouterApiKey,
        },
      });

      onModelSelect(model, client);
      onOpenChange?.(false);
    },
    [config, onModelSelect, onOpenChange]
  );

  const handleOpenChange = (isOpen: boolean) => {
      onOpenChange?.(isOpen);
  };

  return {
    storedKeys: {
      openrouter: config?.openrouterApiKey,
      openai: config?.openaiApiKey,
      google: config?.googleApiKey,
      anthropic: config?.anthropicApiKey,
    },
    hasOpenRouterKey,
    hasPaidKey,
    handleModelSelect,
    handleOpenChange,
  };
}; 