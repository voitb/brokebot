import { useState } from "react";
import { db, type Conversation, type Document, type Message } from "@/lib/db";
import { toast } from "sonner";
import type { ConversationBackup } from "@/lib/schemas/conversation-backup-schema";

export interface ImportedBackupIds {
  conversations: string[];
  folders: string[];
  documents: Document["id"][];
}

export interface UseConversationBackupReturn {
  exportConversations: () => Promise<void>;
  importConversations: (backup: ConversationBackup) => Promise<ImportedBackupIds>;
  isExporting: boolean;
  isImporting: boolean;
}

export function useConversationBackup(): UseConversationBackupReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportConversations = async () => {
    setIsExporting(true);
    try {
      const [conversations, folders, documents] = await Promise.all([
        db.conversations.toArray(),
        db.folders.toArray(),
        db.documents.toArray(),
      ]);
      const backup: ConversationBackup = { conversations, folders, documents };
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `brokebot-conversations-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      toast.error("Failed to export conversations.");
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const importConversations = async (
    backup: ConversationBackup
  ): Promise<ImportedBackupIds> => {
    setIsImporting(true);
    const imported: ImportedBackupIds = { conversations: [], folders: [], documents: [] };

    try {
      await db.transaction("rw", db.conversations, db.folders, db.documents, async () => {
        for (const folder of backup.folders) {
          const existing = await db.folders.get(folder.id);
          if (existing) continue;

          await db.folders.add({
            ...folder,
            createdAt: new Date(folder.createdAt),
            updatedAt: new Date(folder.updatedAt),
          });
          imported.folders.push(folder.id);
        }

        for (const conversation of backup.conversations) {
          const existing = await db.conversations.get(conversation.id);
          if (existing) continue;

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
          imported.conversations.push(normalizedConversation.id);
        }

        for (const document of backup.documents) {
          const normalizedDocument = {
            filename: document.filename,
            content: document.content,
            fileType: document.fileType,
            createdAt: new Date(document.createdAt),
          };

          const existing = await db.documents
            .where("filename")
            .equals(normalizedDocument.filename)
            .filter(
              (stored) =>
                stored.createdAt.getTime() === normalizedDocument.createdAt.getTime() &&
                stored.content === normalizedDocument.content
            )
            .first();
          if (existing) continue;

          imported.documents.push(await db.documents.add(normalizedDocument));
        }
      });
    } catch (error) {
      toast.error("Failed to import conversations.");
      throw error;
    } finally {
      setIsImporting(false);
    }

    return imported;
  };

  return {
    exportConversations,
    importConversations,
    isExporting,
    isImporting,
  };
}
