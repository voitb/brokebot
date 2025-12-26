import Dexie, { type EntityTable } from "dexie";
import { AVAILABLE_MODELS } from "../providers/WebLLMProvider";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  modelId?: string;
  folderId?: string;
}

export interface UserConfig {
  id: "user_config";
  username: string;
  avatarUrl?: string;
  selectedModelId: string;
  autoLoadModel: boolean;
  openrouterApiKey?: string;
  theme: "light" | "dark" | "system";
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id?: number;
  filename: string;
  content: string;
  createdAt: Date;
  fileType: "txt" | "md" | "pdf";
}

export interface EncryptionKey {
  id: string;
  key: CryptoKey;
}

export const DEFAULT_USER_CONFIG: UserConfig = {
  id: "user_config",
  username: "User",
  selectedModelId: AVAILABLE_MODELS[0]?.id ?? "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  autoLoadModel: true,
  theme: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};

type BrokebotDatabase = Dexie & {
  conversations: EntityTable<Conversation, "id">;
  folders: EntityTable<Folder, "id">;
  documents: EntityTable<Document, "id">;
  userConfig: EntityTable<UserConfig, "id">;
  encryptionKey: EntityTable<EncryptionKey, "id">;
};

export function createDatabase(): BrokebotDatabase {
  const db = new Dexie("BrokenbotDB") as BrokebotDatabase;

  // Version 2: Initial stable schema
  db.version(2).stores({
    conversations: "id, title, pinned, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    userConfig: "id, updatedAt",
  });

  // LEGACY: Version 3-5 migrations for removed cloud/sharing features
  // Kept for backward compatibility with existing user databases

  // v3: Added storeConversationsInCloud (removed feature)
  db.version(3)
    .stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    })
    .upgrade(async (tx) => {
      const config = await tx.table("userConfig").get("user_config");
      if (config && config.storeConversationsInCloud === undefined) {
        await tx.table("userConfig").update("user_config", {
          storeConversationsInCloud: false,
        });
      }
    });

  // v4: Added shareId index (removed feature)
  db.version(4).stores({
    conversations: "id, title, pinned, shareId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    userConfig: "id, updatedAt",
  });

  // v5: Migrated to sharedLinks table (removed feature)
  db.version(5)
    .stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: "id, conversationId, createdAt, updatedAt",
      userConfig: "id, updatedAt",
    })
    .upgrade(async (tx) => {
      const conversations = await tx.table("conversations").toArray();
      const sharedLinks = conversations
        .filter((conv) => conv.shareId)
        .map((conv) => ({
          id: conv.shareId,
          conversationId: conv.id,
          title: conv.title,
          allowDownload: true,
          showSharedBy: false,
          anonymizeMessages: false,
          publicDiscovery: false,
          viewCount: 0,
          createdAt: conv.updatedAt,
          updatedAt: conv.updatedAt,
        }));

      if (sharedLinks.length > 0) {
        await tx.table("sharedLinks").bulkAdd(sharedLinks);
      }

      await tx
        .table("conversations")
        .toCollection()
        .modify((conv) => {
          delete conv.shareId;
        });
    });

  // v6: Added folders feature
  db.version(6).stores({
    conversations: "id, title, pinned, folderId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    sharedLinks: "id, conversationId, createdAt, updatedAt",
    userConfig: "id, updatedAt",
    folders: "id, name, createdAt, updatedAt",
  });

  // v7: Remove sharedLinks table - final local-only architecture
  db.version(7).stores({
    conversations: "id, title, pinned, folderId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    sharedLinks: null,
    userConfig: "id, updatedAt",
    folders: "id, name, createdAt, updatedAt",
  });

  // v8: Add encryptionKey table for storing non-extractable CryptoKey
  db.version(8).stores({
    conversations: "id, title, pinned, folderId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    userConfig: "id, updatedAt",
    folders: "id, name, createdAt, updatedAt",
    encryptionKey: "id",
  });

  db.on("ready", async () => {
    const config = await db.userConfig.get("user_config");
    if (!config) {
      await db.userConfig.add(DEFAULT_USER_CONFIG);
    }
  });

  return db;
}

// Default database instance for convenience
export const db = createDatabase();
