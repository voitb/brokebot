import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserConfig, type Conversation, type Message, DEFAULT_USER_CONFIG } from "../lib/db";
import { encryptValue, decryptValue } from "../lib/encryption";
import { useAuth } from "@/providers/AuthProvider";
import {
  getCloudUserConfig,
  createCloudUserConfig,
  updateCloudUserConfig,
} from "../lib/appwrite/database";
import { toast } from "sonner";

export function useUserConfig() {
  const { user } = useAuth();

  const rawConfig = useLiveQuery(
    () => db.userConfig.get("user_config"),
    [],
    DEFAULT_USER_CONFIG
  );

  const [config, setConfig] = React.useState<UserConfig>(DEFAULT_USER_CONFIG);
  const [isSynced, setIsSynced] = React.useState(false);

  // Decrypt local config keys initially
  React.useEffect(() => {
    const decryptConfig = async () => {
      if (rawConfig) {
        const decryptedConfig = { ...rawConfig };
        const keysToDecrypt: (keyof UserConfig)[] = ['openrouterApiKey', 'openaiApiKey', 'anthropicApiKey', 'googleApiKey'];
        
        for (const key of keysToDecrypt) {
            const value = rawConfig[key] as string | undefined;
            if (value) {
                try {
                    (decryptedConfig as any)[key] = await decryptValue(value);
                } catch (e) {
                    console.warn(`Could not decrypt key: ${key}. It might be unencrypted.`);
                    (decryptedConfig as any)[key] = value;
                }
            }
        }
        setConfig(decryptedConfig);
      }
    };
    decryptConfig();
  }, [rawConfig]);

  // Sync with cloud
  React.useEffect(() => {
    const syncConfig = async () => {
      if (user && !isSynced) {
        try {
          const cloudConfigDoc = await getCloudUserConfig(user.$id);
          
          if (cloudConfigDoc) {
            // Cloud config exists, use it as the source of truth
            const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, ...cloudData } = cloudConfigDoc;
            const cloudConfig = { ...cloudData, id: 'user_config' } as unknown as UserConfig;
            
            // We need to decrypt keys from the cloud
            const keysToDecrypt: (keyof UserConfig)[] = ['openrouterApiKey', 'openaiApiKey', 'anthropicApiKey', 'googleApiKey'];
            for (const key of keysToDecrypt) {
                const value = cloudConfig[key] as string | undefined;
                if (value) {
                    (cloudConfig as any)[key] = await decryptValue(value);
                }
            }
            
            await db.userConfig.put(cloudConfig); // Update local DB
            setConfig(cloudConfig);
            toast.info("User settings synced from cloud.");
          } else if (config) {
            // No cloud config, so upload local one
            const { id, ...localConfig } = config;
            await updateConfig(localConfig); // Create in cloud
          }
        } catch (error) {
          console.error("Failed to sync user config:", error);
          toast.error("Failed to sync user settings.");
        } finally {
          setIsSynced(true);
        }
      }
    };

    if(config.storeConversationsInCloud) {
        syncConfig();
    } else {
        setIsSynced(true); // Sync is not enabled, so we consider it "synced"
    }

  }, [user, isSynced, config.storeConversationsInCloud]);

  const updateConfig = async (
    updates: Partial<Omit<UserConfig, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      const encryptedUpdates: Partial<UserConfig> = { ...updates };
      const keysToEncrypt: (keyof UserConfig)[] = [
        "openrouterApiKey",
        "openaiApiKey",
        "anthropicApiKey",
        "googleApiKey",
      ];

      for (const key of keysToEncrypt) {
        const value = updates[key as keyof typeof updates] as string | undefined;
        if (value) {
          (encryptedUpdates as any)[key] = await encryptValue(value);
        }
      }

      const newUpdatedAt = new Date();
      await db.userConfig.update("user_config", {
        ...encryptedUpdates,
        updatedAt: newUpdatedAt,
      });

      // Also update cloud if user is logged in and sync is enabled
      if (
        user &&
        (config.storeConversationsInCloud || updates.storeConversationsInCloud)
      ) {
        // Define the exact set of keys that are allowed in the Appwrite userConfig collection.
        // This acts as a safelist to prevent sending local-only fields to the cloud.
        const CLOUD_CONFIG_KEYS = [
          "userId",
          "username",
          "avatarUrl",
          "theme",
          "autoLoadModel",
          "openaiApiKey",
          "anthropicApiKey",
          "googleApiKey",
          "openrouterApiKey",
          "storeConversationsLocally",
          "storeConversationsInCloud",
        ];

        // "Upsert" logic: check if config exists, then create or update.
        const existingCloudConfig = await getCloudUserConfig(user.$id);

        if (existingCloudConfig) {
          // UPDATE: Config exists, send only the filtered, encrypted partial updates.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...updatesForCloud } = encryptedUpdates;

          const payload = Object.fromEntries(
            Object.entries(updatesForCloud).filter(([key]) =>
              CLOUD_CONFIG_KEYS.includes(key)
            )
          );

          if (Object.keys(payload).length > 0) {
            await updateCloudUserConfig(user.$id, payload);
          }
        } else {
          // CREATE: Config does not exist, send the full, filtered config.
          const fullConfigForCloud = { ...config, ...updates };

          const keysToReEncrypt: (keyof UserConfig)[] = [
            "openrouterApiKey", "openaiApiKey", "anthropicApiKey", "googleApiKey",
          ];
          const fullEncryptedPayload = { ...fullConfigForCloud };
          for (const key of keysToReEncrypt) {
            const value = fullConfigForCloud[key as keyof typeof fullConfigForCloud] as string | undefined;
            if (value) {
              (fullEncryptedPayload as any)[key] = await encryptValue(value);
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...fullPayload } = fullEncryptedPayload;
          (fullPayload as any).userId = user.$id;

          const payload = Object.fromEntries(
            Object.entries(fullPayload).filter(([key]) =>
              CLOUD_CONFIG_KEYS.includes(key)
            )
          );

          await createCloudUserConfig(user.$id, payload);
        }
      }
    } catch (error) {
      console.error("Error updating user config:", error);
      toast.error("Failed to save settings to the cloud.");
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

  const importConversations = async (conversations: Conversation[]): Promise<number> => {
    try {
      // Add conversations to database
      let importedCount = 0;
      
      for (const conversation of conversations) {
        // Check if conversation already exists
        const existing = await db.conversations.get(conversation.id);
        if (!existing) {
          // Ensure the conversation has proper date objects
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
    } catch (error) {
      console.error("Error importing conversations:", error);
      throw error;
    }
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