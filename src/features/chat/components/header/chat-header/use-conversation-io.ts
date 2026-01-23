import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Conversation } from "@/lib/db";
import { ConversationSchema } from "@/lib/schemas/conversation-schema";
import { toast } from "sonner";

interface UseConversationIOOptions {
  conversation?: Conversation;
  importConversations: (conversations: Conversation[]) => Promise<number>;
}

interface UseConversationIOReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleExportConversation: () => void;
  handleImportConversation: () => void;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useConversationIO({
  conversation,
  importConversations,
}: UseConversationIOOptions): UseConversationIOReturn {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConversation = () => {
    if (!conversation) return;

    try {
      const dataStr = JSON.stringify(conversation, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `conversation-${conversation.id}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch {
      toast.error("Failed to export conversation.");
    }
  };

  const handleImportConversation = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file.");
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const parsed = ConversationSchema.safeParse(jsonData);

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        const fieldPath = firstIssue?.path.join(".") || "unknown";
        toast.error(
          `Invalid conversation format: ${fieldPath} - ${firstIssue?.message}`
        );
        return;
      }

      const importedConv = parsed.data as Conversation;
      const importedCount = await importConversations([importedConv]);

      if (importedCount > 0) {
        toast.success("Conversation imported successfully!");
        navigate(`/chat/${importedConv.id}`);
      } else {
        toast.info("Conversation already exists. No changes were made.");
      }
    } catch {
      toast.error("Failed to parse conversation file. Invalid JSON.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    fileInputRef,
    handleExportConversation,
    handleImportConversation,
    handleFileImport,
  };
}
