import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type IUserConfig, DEFAULT_USER_CONFIG } from "../lib/db";
import { encryptValue, decryptValue } from "../lib/encryption";

export function useUserConfig() {
  const rawConfig = useLiveQuery(
    () => db.userConfig.get("user_config"),
    [],
    DEFAULT_USER_CONFIG
  );

  // Decrypt API keys when reading from database
  const [config, setConfig] = React.useState<IUserConfig>(DEFAULT_USER_CONFIG);

  React.useEffect(() => {
    const decryptConfig = async () => {
      if (rawConfig) {
        const decryptedConfig = { ...rawConfig };
        
        if (rawConfig.openaiApiKey) {
          decryptedConfig.openaiApiKey = await decryptValue(rawConfig.openaiApiKey);
        }
        if (rawConfig.anthropicApiKey) {
          decryptedConfig.anthropicApiKey = await decryptValue(rawConfig.anthropicApiKey);
        }
        if (rawConfig.googleApiKey) {
          decryptedConfig.googleApiKey = await decryptValue(rawConfig.googleApiKey);
        }
        
        setConfig(decryptedConfig);
      }
    };

    decryptConfig();
  }, [rawConfig]);

  const updateConfig = async (updates: Partial<Omit<IUserConfig, "id" | "createdAt" | "updatedAt">>) => {
    try {
      // Encrypt API keys before saving
      const encryptedUpdates = { ...updates };
      
      if (updates.openaiApiKey) {
        encryptedUpdates.openaiApiKey = await encryptValue(updates.openaiApiKey);
      }
      if (updates.anthropicApiKey) {
        encryptedUpdates.anthropicApiKey = await encryptValue(updates.anthropicApiKey);
      }
      if (updates.googleApiKey) {
        encryptedUpdates.googleApiKey = await encryptValue(updates.googleApiKey);
      }

      await db.userConfig.update("user_config", {
        ...encryptedUpdates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user config:", error);
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
      console.error("Error resetting user config:", error);
    }
  };

  const clearAllData = async () => {
    try {
      await db.conversations.clear();
      await db.documents.clear();
      await resetConfig();
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  };

  const exportConversations = async () => {
    try {
      const conversations = await db.conversations.toArray();
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `local-gpt-conversations-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting conversations:", error);
    }
  };

  return {
    config: config || DEFAULT_USER_CONFIG,
    updateConfig,
    resetConfig,
    clearAllData,
    exportConversations,
  };
} 