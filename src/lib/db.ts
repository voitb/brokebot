// src/lib/db.ts
import Dexie, { type EntityTable } from "dexie";
// Import will be used in hooks

// Definicja interfejsu dla pojedynczej wiadomości
export interface IMessage {
  id: string; // Unikalne ID dla każdej wiadomości
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

// Definicja interfejsu dla całej konwersacji
export interface IConversation {
  id: string;
  title: string;
  messages: IMessage[];
  pinned: boolean;
  shareId?: string; // Optional share ID for public sharing
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument {
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

export interface IUserConfig {
  id: "user_config"; // Always same ID for singleton
  fullName: string;
  nickname: string;
  workFunction: string;
  preferences: string;
  selectedModelId: string;
  autoLoadModel: boolean;
  storeConversationsLocally: boolean;
  storeConversationsInCloud: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  // API Keys
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Default configuration
export const DEFAULT_USER_CONFIG: IUserConfig = {
  id: "user_config",
  fullName: "User",
  nickname: "User", 
  workFunction: "",
  preferences: "",
  selectedModelId: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  autoLoadModel: true,
  storeConversationsLocally: true,
  storeConversationsInCloud: false,
  compactMode: false,
  showTimestamps: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class LocalGptDB extends Dexie {
  conversations!: EntityTable<IConversation, "id">;
  documents!: EntityTable<IDocument, "id">;
  sharedLinks!: EntityTable<ISharedLink, "id">;
  userConfig!: EntityTable<IUserConfig, "id">;

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