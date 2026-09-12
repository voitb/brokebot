import { useState } from "react";
import { useUserConfig } from "@/hooks/use-user-config";
import { toast } from "sonner";
import { type UserConfig } from "@/lib/db";

export type SettingsTab = "general" | "documents" | "privacy";

const VALID_SETTINGS_TABS: SettingsTab[] = ["general", "documents", "privacy"];

export function isValidSettingsTab(value: string | null): value is SettingsTab {
  return value !== null && VALID_SETTINGS_TABS.includes(value as SettingsTab);
}

export interface UseSettingsReturn {
  settings: Partial<UserConfig>;
  isSaving: boolean;
  handleFieldChange: <K extends keyof UserConfig>(field: K, value: UserConfig[K]) => void;
  handleSaveChanges: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const { config, updateConfig } = useUserConfig();
  const [draft, setDraft] = useState<Partial<UserConfig>>({});
  const [isSaving, setIsSaving] = useState(false);

  const settings: Partial<UserConfig> = { ...config, ...draft };

  const handleFieldChange = <K extends keyof UserConfig>(field: K, value: UserConfig[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateConfig(draft);
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
    setDraft({});
    toast.success("Settings saved successfully!");
  };

  return {
    settings,
    isSaving,
    handleFieldChange,
    handleSaveChanges,
  };
}
