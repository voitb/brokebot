import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserConfig, DEFAULT_USER_CONFIG } from "@/lib/db";
import { encryptValue, decryptValue } from "@/lib/encryption-service";
import { toast } from "sonner";

export interface UseUserConfigReturn {
  config: UserConfig;
  isLoading: boolean;
  updateConfig: (updates: Partial<Omit<UserConfig, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
  resetConfig: () => Promise<void>;
}

export function useUserConfig(): UseUserConfigReturn {
  const rawConfig = useLiveQuery(() => db.userConfig.get("user_config"), []);

  const [config, setConfig] = useState<UserConfig>(DEFAULT_USER_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const decryptConfig = async () => {
      if (rawConfig) {
        const decryptedConfig: UserConfig = { ...rawConfig };

        if (rawConfig.openrouterApiKey) {
          try {
            decryptedConfig.openrouterApiKey = await decryptValue(rawConfig.openrouterApiKey);
          } catch {
            decryptedConfig.openrouterApiKey = "";
          }
        }

        if (!cancelled) {
          setConfig(decryptedConfig);
          setIsLoading(false);
        }
      }
    };
    decryptConfig();

    return () => {
      cancelled = true;
    };
  }, [rawConfig]);

  const updateConfig = async (
    updates: Partial<Omit<UserConfig, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const encryptedUpdates = { ...updates };

      if (updates.openrouterApiKey) {
        encryptedUpdates.openrouterApiKey = await encryptValue(updates.openrouterApiKey);
      }

      await db.userConfig.update("user_config", {
        ...encryptedUpdates,
        updatedAt: new Date(),
      });
    } catch (error) {
      toast.error("Failed to save settings.");
      throw error;
    }
  };

  const resetConfig = async () => {
    try {
      const newConfig = {
        ...DEFAULT_USER_CONFIG,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.userConfig.put(newConfig);
    } catch (error) {
      toast.error("Failed to reset settings.");
      throw error;
    }
  };

  return {
    config,
    isLoading,
    updateConfig,
    resetConfig,
  };
}
