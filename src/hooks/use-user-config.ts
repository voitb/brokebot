import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserConfig, type Conversation, type Message, DEFAULT_USER_CONFIG } from "@/lib/db";
import { encryptValue, decryptValue } from "@/lib/encryption-service";
import { toast } from "sonner";

export function useUserConfig() {
  const rawConfig = useLiveQuery(
    () => db.userConfig.get("user_config"),
    [],
    DEFAULT_USER_CONFIG
  );

  const [config, setConfig] = useState<UserConfig>(DEFAULT_USER_CONFIG);

  useEffect(() => {
    let cancelled = false;

    const decryptConfig = async () => {
      if (rawConfig) {
        const decryptedConfig: UserConfig = { ...rawConfig };

        if (rawConfig.openrouterApiKey) {
          try {
            decryptedConfig.openrouterApiKey = await decryptValue(rawConfig.openrouterApiKey);
          } catch {
            decryptedConfig.openrouterApiKey = rawConfig.openrouterApiKey;
          }
        }

        if (!cancelled) {
          setConfig(decryptedConfig);
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
    } catch {
      toast.error("Failed to save settings.");
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
    } catch {
      // Silent fail - reset is non-critical
    }
  };

  const clearAllData = async () => {
    try {
      await db.conversations.clear();
      await db.documents.clear();
      await db.folders.clear();
      await resetConfig();
    } catch {
      toast.error("Failed to clear data.");
    }
  };

  const exportConversations = async () => {
    try {
      const conversations = await db.conversations.toArray();
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `brokebot-conversations-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch {
      toast.error("Failed to export conversations.");
    }
  };

  const importConversations = async (conversations: Conversation[]): Promise<number> => {
    let importedCount = 0;

    for (const conversation of conversations) {
      const existing = await db.conversations.get(conversation.id);
      if (!existing) {
        const normalizedConversation: Conversation = {
          ...conversation,
          createdAt: new Date(conversation.createdAt),
          updatedAt: new Date(conversation.updatedAt),
          messages: conversation.messages.map((msg: Message) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          })),
        };

        await db.conversations.add(normalizedConversation);
        importedCount++;
      }
    }

    return importedCount;
  };

  return {
    config: config || DEFAULT_USER_CONFIG,
    updateConfig,
    resetConfig,
    clearAllData,
    exportConversations,
    importConversations,
  };
}
