import { useState } from "react";
import { db, type Conversation, type Message } from "@/lib/db";
import { toast } from "sonner";
import { useMounted } from "./use-mounted";

export interface UseConversationBackupReturn {
  exportConversations: () => Promise<void>;
  importConversations: (conversations: Conversation[]) => Promise<number>;
  isExporting: boolean;
  isImporting: boolean;
}

export function useConversationBackup(): UseConversationBackupReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const mountedRef = useMounted();

  const exportConversations = async () => {
    setIsExporting(true);
    try {
      const conversations = await db.conversations.toArray();
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `brokebot-conversations-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch {
      toast.error("Failed to export conversations.");
    } finally {
      if (mountedRef.current) {
        setIsExporting(false);
      }
    }
  };

  const importConversations = async (conversations: Conversation[]): Promise<number> => {
    setIsImporting(true);
    let importedCount = 0;

    try {
      for (const conversation of conversations) {
        const existing = await db.conversations.get(conversation.id);
        if (!existing) {
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
    } catch {
      toast.error("Failed to import conversations.");
    } finally {
      if (mountedRef.current) {
        setIsImporting(false);
      }
    }

    return importedCount;
  };

  return {
    exportConversations,
    importConversations,
    isExporting,
    isImporting,
  };
}
