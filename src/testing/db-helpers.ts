import { db } from "@/lib/db";
import type { Conversation, Folder, Document } from "@/lib/db";
import { createMockConversation, createMockFolder, createMockDocument } from "./mocks/factories";

export async function clearTestDatabase() {
  await db.conversations.clear();
  await db.folders.clear();
  await db.documents.clear();
}

export async function seedConversation(data: Partial<Conversation> = {}): Promise<Conversation> {
  const conversation = createMockConversation(data);
  await db.conversations.add(conversation);
  return conversation;
}

export async function seedFolder(data: Partial<Folder> = {}): Promise<Folder> {
  const folder = createMockFolder(data);
  await db.folders.add(folder);
  return folder;
}

export async function seedDocument(data: Partial<Document> = {}): Promise<Document> {
  const document = createMockDocument(data);
  const id = await db.documents.add(document);
  return { ...document, id };
}

export async function seedConversationWithMessages(
  conversationData: Partial<Conversation> = {},
  messageCount: number = 2
): Promise<Conversation> {
  const messages = Array.from({ length: messageCount }, (_, i) => ({
    id: `msg-${i}`,
    role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
    content: `Message ${i + 1}`,
    createdAt: new Date(Date.now() + i * 1000),
  }));

  return seedConversation({ ...conversationData, messages });
}
