import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserConfig } from "../../../../../hooks/useUserConfig";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";

interface UserInfo {
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

export const usePrivacySettings = (userInfo?: UserInfo, hasConversations = false) => {
  const {
    config,
    updateConfig,
    resetConfig,
    clearAllData,
    exportConversations,
    importConversations,
  } = useUserConfig();
  const { triggerSync } = useConversations();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false);

  // Use subscription status from props or fallback to mock
  const hasActiveSubscription = userInfo?.hasActiveSubscription ?? false;

  const handleToggleCloudStorage = async (checked: boolean) => {
    if (checked && !hasActiveSubscription) {
      toast.error("Cloud storage is only available with a paid subscription");
      return;
    }

    await updateConfig({ storeConversationsInCloud: checked });
    toast.success(checked ? "Cloud storage enabled" : "Cloud storage disabled");

    if (checked) {
      // Pass the new state directly to ensure the check inside triggerSync passes,
      // bypassing any potential state propagation delay.
      triggerSync({ cloudStorageEnabled: true });
    }
  };

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
    event: React.ChangeEvent<HTMLInputElement>
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
    } catch (error) {
      console.error("Import error:", error);
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
    // State
    config,
    hasActiveSubscription,
    hasConversations,
    showClearDataDialog,
    showResetSettingsDialog,
    fileInputRef,

    // Actions
    handleToggleCloudStorage,
    handleClearAllDataConfirm,
    handleResetSettingsConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,

    // Dialog controls
    setShowClearDataDialog,
    setShowResetSettingsDialog,
  };
}; 