// src/lib/db.ts
import Dexie, { type EntityTable } from "dexie";
// Import will be used in hooks
import { AVAILABLE_MODELS } from "../providers/WebLLMProvider";

// Define interfaces for database tables
export interface Message {
  id: string; // uuid
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Folder {
  id: string; // uuid
  name: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string; // uuid
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  modelId?: string; // To track which model was used
  folderId?: string;
}

export interface UserConfig {
  id: "user_config";
  username: string;
  avatarUrl?: string;
  selectedModelId: string;
  autoLoadModel: boolean;
  storeConversationsInCloud?: boolean;
  openrouterApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
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

export interface ISharedLink {
  id: string; // Unique share ID
  conversationId: string; // FK to conversations
  title: string; // Conversation title at time of sharing
  allowDownload: boolean;
  showSharedBy: boolean;
  anonymizeMessages: boolean;
  publicDiscovery: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Default configuration
export const DEFAULT_USER_CONFIG: UserConfig = {
  id: "user_config",
  username: "User",
  selectedModelId: AVAILABLE_MODELS[0].id,
  autoLoadModel: true,
  storeConversationsInCloud: false,
  theme: "system",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class LocalGptDB extends Dexie {
  conversations!: EntityTable<Conversation, "id">;
  folders!: EntityTable<Folder, "id">;
  documents!: EntityTable<Document, "id">;
  sharedLinks!: EntityTable<ISharedLink, "id">;
  userConfig!: EntityTable<UserConfig, "id">;

  constructor() {
    super("LocalGptDB");
    
    // Version 2 schema
    this.version(2).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    });

    // Version 3 schema - adds storeConversationsInCloud field
    this.version(3).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    }).upgrade(async (tx) => {
      // Add default value for new field to existing configs
      const config = await tx.table('userConfig').get('user_config');
      if (config && config.storeConversationsInCloud === undefined) {
        await tx.table('userConfig').update('user_config', {
          storeConversationsInCloud: false
        });
      }
    });

    // Version 4 schema - adds shareId field to conversations
    this.version(4).stores({
      conversations: "id, title, pinned, shareId, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      userConfig: "id, updatedAt",
    });

    // Version 5 schema - adds sharedLinks table and removes shareId from conversations
    this.version(5).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: "id, conversationId, createdAt, updatedAt",
      userConfig: "id, updatedAt",
    }).upgrade(async (tx) => {
      // Migrate existing shareId data to new sharedLinks table
      const conversations = await tx.table('conversations').toArray();
      const sharedLinks = conversations
        .filter(conv => conv.shareId)
        .map(conv => ({
          id: conv.shareId,
          conversationId: conv.id,
          title: conv.title,
          allowDownload: true, // Default values for existing shares
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
      
      // Remove shareId field from conversations
      await tx.table('conversations').toCollection().modify(conv => {
        delete conv.shareId;
      });
    });

    // Version 6 schema - adds folders table and folderId to conversations
    this.version(6).stores({
      conversations: "id, title, pinned, folderId, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
      sharedLinks: "id, conversationId, createdAt, updatedAt",
      userConfig: "id, updatedAt",
      folders: "id, name, createdAt, updatedAt",
    });

    // Initialize default config on first run
    this.on("ready", async () => {
      const config = await this.userConfig.get("user_config");
      if (!config) {
        await this.userConfig.add(DEFAULT_USER_CONFIG);
      }
    });
  }
}

export const db = new LocalGptDB();