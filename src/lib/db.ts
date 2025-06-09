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

export class LocalGptDB extends Dexie {
  conversations!: EntityTable<IConversation, "id">;
  documents!: EntityTable<IDocument, "id">;

  constructor() {
    super("LocalGptDB");
    this.version(1).stores({
      conversations: "id, title, pinned, createdAt, updatedAt",
      documents: "++id, filename, fileType, createdAt",
    });
  }
}

export const db = new LocalGptDB();