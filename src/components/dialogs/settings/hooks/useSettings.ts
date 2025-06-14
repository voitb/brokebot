import { useState, useEffect } from "react";
import { useUserConfig } from "@/hooks/useUserConfig";
import { toast } from "sonner";
import { type UserConfig } from "@/lib/db";

export type SettingsTab = "general" | "privacy" | "billing";

export const useSettings = () => {
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
    } catch (error) {
      toast.error("Failed to save settings.");
      console.error(error);
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
}; 