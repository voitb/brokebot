import Dexie, { type EntityTable } from "dexie";

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

  db.version(2).stores({
    conversations: "id, title, pinned, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    userConfig: "id, updatedAt",
  });

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

  db.version(4).stores({
    conversations: "id, title, pinned, shareId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    userConfig: "id, updatedAt",
  });

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

  db.version(6).stores({
    conversations: "id, title, pinned, folderId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    sharedLinks: "id, conversationId, createdAt, updatedAt",
    userConfig: "id, updatedAt",
    folders: "id, name, createdAt, updatedAt",
  });

  db.version(7).stores({
    conversations: "id, title, pinned, folderId, createdAt, updatedAt",
    documents: "++id, filename, fileType, createdAt",
    sharedLinks: null,
    userConfig: "id, updatedAt",
    folders: "id, name, createdAt, updatedAt",
  });

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

export const db = createDatabase();
