import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUserConfig } from "@/hooks/use-user-config";
import { toast } from "sonner";

export const usePrivacySettings = (hasConversations = false) => {
  const {
    config,
    resetConfig,
    clearAllData,
    exportConversations,
    importConversations,
  } = useUserConfig();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false);

  const handleClearAllDataConfirm = async () => {
    await clearAllData();
    toast.success("All data cleared successfully");
    setShowClearDataDialog(false);
    navigate("/");
  };

  const handleResetSettingsConfirm = async () => {
    await resetConfig();
    toast.success("Settings reset to defaults");
    setShowResetSettingsDialog(false);
  };

  const handleExportConversations = async () => {
    await exportConversations();
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

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file");
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate that it's a conversations export
      if (
        !Array.isArray(data) ||
        !data.every((conv) => conv.id && conv.messages)
      ) {
        toast.error("Invalid conversation file format");
        return;
      }

      const count = await importConversations(data);
      toast.success(`Successfully imported ${count} conversation(s)`);
    } catch {
      toast.error(
        "Failed to import conversations. Please check the file format."
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    config,
    hasConversations,
    showClearDataDialog,
    showResetSettingsDialog,
    fileInputRef,
    handleClearAllDataConfirm,
    handleResetSettingsConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,
    setShowClearDataDialog,
    setShowResetSettingsDialog,
  };
}; 