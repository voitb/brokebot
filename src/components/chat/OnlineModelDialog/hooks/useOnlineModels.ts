import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  OpenRouterClient,
  type OpenRouterModel,
} from "@/lib/openrouter";
import { functions } from "@/lib/appwriteClient";
import {
  getStoredApiKeys,
  hasApiKey,
  type ApiKeys,
} from "@/lib/apiKeys";

export const useOnlineModels = (
  open: boolean | undefined,
  onModelSelect: (
    model: OpenRouterModel,
    client: OpenRouterClient | null
  ) => void,
  onOpenChange?: (open: boolean) => void
) => {
  const [storedKeys, setStoredKeys] = useState<ApiKeys>(getStoredApiKeys());
  const hasOpenRouterKey = !!storedKeys.openrouter;
  const hasPaidKey = !!(
    storedKeys.openai ||
    storedKeys.google ||
    storedKeys.anthropic
  );

  useEffect(() => {
    if (open) {
      setStoredKeys(getStoredApiKeys());
    }
  }, [open]);

  const handleModelSelect = useCallback(
    (model: OpenRouterModel) => {
      if (!hasApiKey(model.provider as keyof ApiKeys)) {
        toast.error(`Please add your ${model.provider} API key first`);
        return;
      }

      const client = new OpenRouterClient({
        functions,
        siteUrl: window.location.origin,
        siteName: "Local GPT",
      });

      onModelSelect(model, client);
      onOpenChange?.(false);
    },
    [onModelSelect, onOpenChange]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setStoredKeys(getStoredApiKeys());
      }
      onOpenChange?.(isOpen);
    },
    [onOpenChange]
  );

  return {
    storedKeys,
    hasOpenRouterKey,
    hasPaidKey,
    handleModelSelect,
    handleOpenChange,
  };
}; 