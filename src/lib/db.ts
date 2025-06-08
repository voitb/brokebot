// src/lib/db.ts
import Dexie, { type Table } from "dexie";
import { v4 as uuidv4 } from "uuid"; // Zainstaluj: npm install uuid @types/uuid

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

export class BrokeBotDB extends Dexie {
  conversations!: Table<IConversation>;

  constructor() {
    super("BrokeBotDB");
    this.version(1).stores({
      // Indeksujemy 'id' jako klucz główny, a 'updatedAt' i 'pinned' do sortowania
      conversations: "&id, updatedAt, pinned",
    });
  }
}

export const db = new BrokeBotDB();