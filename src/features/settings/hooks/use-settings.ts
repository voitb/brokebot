import { useState, useEffect } from "react";
import { useUserConfig } from "@/shared/hooks/use-user-config";
import { toast } from "sonner";
import { type UserConfig } from "@/lib/db";

export type SettingsTab = "general" | "documents" | "privacy";

export interface UseSettingsReturn {
  settings: Partial<UserConfig>;
  isSaving: boolean;
  handleFieldChange: <K extends keyof UserConfig>(field: K, value: UserConfig[K]) => void;
  handleSaveChanges: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const { config, updateConfig } = useUserConfig();
  const [settings, setSettings] = useState<Partial<UserConfig>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setSettings(config);
    }
  }, [config]);

  const handleFieldChange = <K extends keyof UserConfig>(field: K, value: UserConfig[K]) => {
      setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateConfig(settings);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isSaving,
    handleFieldChange,
    handleSaveChanges,
  };
} 