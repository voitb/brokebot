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

export const DEFAULT_USER_CONFIG: UserConfig = {
  id: "user_config",
  username: "User",
  selectedModelId: AVAILABLE_MODELS[0].id,
  autoLoadModel: true,
  theme: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class LocalGptDB extends Dexie {
  conversations!: EntityTable<Conversation, "id">;
  folders!: EntityTable<Folder, "id">;
  documents!: EntityTable<Document, "id">;
  userConfig!: EntityTable<UserConfig, "id">;

  constructor() {
    super("LocalGptDB");

    this.version(2).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    });

    this.version(3).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    }).upgrade(async (tx) => {
      const config = await tx.table('userConfig').get('user_config');
      if (config && config.storeConversationsInCloud === undefined) {
        await tx.table('userConfig').update('user_config', {
          storeConversationsInCloud: false
        });
      }
    });

    this.version(4).stores({
      conversations: "id, title, pinned, shareId, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    });

    this.version(5).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: "id, conversationId, createdAt, updatedAt",
      userConfig: "id, updatedAt",
    }).upgrade(async (tx) => {
      const conversations = await tx.table('conversations').toArray();
      const sharedLinks = conversations
        .filter(conv => conv.shareId)
        .map(conv => ({
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
        await tx.table('sharedLinks').bulkAdd(sharedLinks);
      }

      await tx.table('conversations').toCollection().modify(conv => {
        delete conv.shareId;
      });
    });

    this.version(6).stores({
      conversations: "id, title, pinned, folderId, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: "id, conversationId, createdAt, updatedAt",
      userConfig: "id, updatedAt",
      folders: "id, name, createdAt, updatedAt",
    });

    // Version 7 - Remove sharedLinks table (local-only architecture)
    this.version(7).stores({
      conversations: "id, title, pinned, folderId, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: null, // Delete the table
      userConfig: "id, updatedAt",
      folders: "id, name, createdAt, updatedAt",
    });

    this.on("ready", async () => {
      const config = await this.userConfig.get("user_config");
      if (!config) {
        await this.userConfig.add(DEFAULT_USER_CONFIG);
      }
    });
  }
}

export const db = new LocalGptDB();
