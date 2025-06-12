import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import { type UserConfig } from "../../../../lib/db";

// This function is local now as it's small and only used here.
function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

// Map provider keys to UserConfig keys
const providerToConfigKey: Record<string, keyof UserConfig> = {
  openrouter: "openrouterApiKey",
  openai: "openaiApiKey",
  google: "googleApiKey",
  anthropic: "anthropicApiKey",
};

export const useApiKeyManager = (provider: keyof typeof providerToConfigKey) => {
  const { config, updateConfig } = useUserConfig();
  const configKey = providerToConfigKey[provider];

  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (config && configKey) {
      const keyExists = !!config[configKey];
      setHasStoredKey(keyExists);
      if (keyExists) {
        setApiKey(maskApiKey(config[configKey] as string));
      } else {
        setApiKey("");
      }
    }
  }, [config, configKey]);

  const handleApiKeySave = async () => {
    if (!apiKey.trim() || apiKey.includes("••••")) {
      toast.error("Please enter a valid API key");
      return;
    }

    await updateConfig({ [configKey]: apiKey });
    setHasStoredKey(true);
    setApiKey(maskApiKey(apiKey));
    setIsEditing(false);
    toast.success("API key saved successfully");
  };

  const handleApiKeyRemove = async () => {
    await updateConfig({ [configKey]: "" });
    setHasStoredKey(false);
    setApiKey("");
    setIsEditing(false);
    toast.success("API key removed");
  };

  const startEditing = () => {
    if (config && configKey) {
      setApiKey((config[configKey] as string) || "");
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (config && configKey) {
      const currentKey = config[configKey] as string;
      setApiKey(currentKey ? maskApiKey(currentKey) : "");
    }
    setIsEditing(false);
  };

  return {
    apiKey,
    setApiKey,
    hasStoredKey,
    isEditing,
    handleApiKeySave,
    handleApiKeyRemove,
    startEditing,
    cancelEditing,
  };
}; 