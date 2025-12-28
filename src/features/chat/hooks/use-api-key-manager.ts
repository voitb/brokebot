import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserConfig } from "@/shared/hooks/use-user-config";

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export interface UseApiKeyManagerReturn {
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  hasStoredKey: boolean;
  isEditing: boolean;
  handleApiKeySave: () => Promise<void>;
  handleApiKeyRemove: () => Promise<void>;
  startEditing: () => void;
  cancelEditing: () => void;
}

export function useApiKeyManager(provider: "openrouter"): UseApiKeyManagerReturn {
  const { config, updateConfig } = useUserConfig();

  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (config && provider === "openrouter") {
      const keyExists = !!config.openrouterApiKey;
      setHasStoredKey(keyExists);
      setApiKey(keyExists ? maskApiKey(config.openrouterApiKey!) : "");
    }
  }, [config, provider]);

  const handleApiKeySave = async () => {
    if (!apiKey.trim() || apiKey.includes("••••")) {
      toast.error("Please enter a valid API key");
      return;
    }

    await updateConfig({ openrouterApiKey: apiKey });
    setHasStoredKey(true);
    setApiKey(maskApiKey(apiKey));
    setIsEditing(false);
    toast.success("API key saved successfully");
  };

  const handleApiKeyRemove = async () => {
    await updateConfig({ openrouterApiKey: "" });
    setHasStoredKey(false);
    setApiKey("");
    setIsEditing(false);
    toast.success("API key removed");
  };

  const startEditing = () => {
    if (config) {
      setApiKey(config.openrouterApiKey || "");
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (config) {
      const currentKey = config.openrouterApiKey;
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
}
