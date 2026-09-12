import { useState, useRef, type ChangeEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useUserConfig } from "@/hooks/use-user-config";
import { useDataManagement } from "@/hooks/use-data-management";
import { useConversationBackup } from "@/hooks/use-conversation-backup";
import {
  parseConversationBackup,
  type ConversationBackup,
} from "@/lib/schemas/conversation-backup-schema";
import { toast } from "sonner";
import { db } from "@/lib/db";

export interface UsePrivacySettingsReturn {
  hasApiKey: boolean;
  hasConversations: boolean;
  hasDocuments: boolean;
  hasFolders: boolean;
  showClearDataDialog: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleClearAllDataConfirm: () => Promise<void>;
  handleExportConversations: () => Promise<void>;
  handleImportClick: () => void;
  handleFileImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  setShowClearDataDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePrivacySettings(): UsePrivacySettingsReturn {
  const { config } = useUserConfig();
  const { clearAllData } = useDataManagement();
  const { exportConversations, importConversations } = useConversationBackup();

  const conversationCount = useLiveQuery(() => db.conversations.count(), []);
  const documentCount = useLiveQuery(() => db.documents.count(), []);
  const folderCount = useLiveQuery(() => db.folders.count(), []);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showClearDataDialog, setShowClearDataDialog] = useState(false);

  const handleClearAllDataConfirm = async () => {
    try {
      await clearAllData();
    } catch {
      return;
    }
    toast.success("All data cleared successfully");
    setShowClearDataDialog(false);
    navigate("/");
  };

  const handleExportConversations = async () => {
    try {
      await exportConversations();
    } catch {
      return;
    }
    toast.success("Conversations exported successfully");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please select a valid JSON file");
      return;
    }

    try {
      let backup: ConversationBackup;

      try {
        const text = await file.text();
        const parsed = parseConversationBackup(JSON.parse(text));

        if (!parsed.success) {
          toast.error("Invalid conversation file format");
          return;
        }

        backup = parsed.backup;
      } catch {
        toast.error(
          "Failed to import conversations. Please check the file format."
        );
        return;
      }

      let count: number;

      try {
        count = (await importConversations(backup)).conversations.length;
      } catch {
        return;
      }

      if (count > 0) {
        toast.success(`Successfully imported ${count} conversation(s)`);
      } else {
        toast.info("No new conversations to import.");
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    hasApiKey: !!config.openrouterApiKey,
    hasConversations: (conversationCount ?? 0) > 0,
    hasDocuments: (documentCount ?? 0) > 0,
    hasFolders: (folderCount ?? 0) > 0,
    showClearDataDialog,
    fileInputRef,
    handleClearAllDataConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,
    setShowClearDataDialog,
  };
}
