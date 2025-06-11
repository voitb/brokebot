import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getStoredApiKeys,
  storeApiKey,
  removeApiKey,
  hasApiKey,
  maskApiKey,
  type ApiKeys,
} from "../../../../lib/apiKeys";

export const useApiKeyManager = (provider: keyof ApiKeys) => {
  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const keys = getStoredApiKeys();
    const keyExists = hasApiKey(provider);
    setHasStoredKey(keyExists);
    if (keyExists && keys[provider]) {
      setApiKey(maskApiKey(keys[provider]!));
    } else {
      setApiKey("");
    }
  }, [provider]);

  const handleApiKeySave = () => {
    if (!apiKey.trim() || apiKey.includes("••••")) {
      toast.error("Please enter a valid API key");
      return;
    }

    storeApiKey(provider, apiKey);
    setHasStoredKey(true);
    setApiKey(maskApiKey(apiKey));
    setIsEditing(false);
    toast.success("API key saved successfully");
  };

  const handleApiKeyRemove = () => {
    removeApiKey(provider);
    setHasStoredKey(false);
    setApiKey("");
    setIsEditing(false);
    toast.success("API key removed");
  };
  
  const startEditing = () => {
    const keys = getStoredApiKeys();
    setApiKey(keys[provider] || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    const keys = getStoredApiKeys();
    const currentKey = keys[provider];
    setApiKey(currentKey ? maskApiKey(currentKey) : "");
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