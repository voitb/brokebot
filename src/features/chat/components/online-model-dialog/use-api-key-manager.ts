import { useState, useRef } from "react";
import { toast } from "sonner";
import { useUserConfig } from "@/hooks/use-user-config";

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

  const hasStoredKey = !!(provider === "openrouter" && config?.openrouterApiKey);
  const maskedKey = config?.openrouterApiKey ? maskApiKey(config.openrouterApiKey) : "";

  const [apiKey, setApiKey] = useState(maskedKey);
  const [isEditing, setIsEditing] = useState(false);
  const prevMaskedKeyRef = useRef(maskedKey);

  if (prevMaskedKeyRef.current !== maskedKey) {
    prevMaskedKeyRef.current = maskedKey;
    if (!isEditing) {
      setApiKey(maskedKey);
    }
  }

  const handleApiKeySave = async () => {
    if (!apiKey.trim() || apiKey.includes("••••")) {
      toast.error("Please enter a valid API key");
      return;
    }

    await updateConfig({ openrouterApiKey: apiKey });
    setApiKey(maskApiKey(apiKey));
    setIsEditing(false);
    toast.success("API key saved successfully");
  };

  const handleApiKeyRemove = async () => {
    await updateConfig({ openrouterApiKey: "" });
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
