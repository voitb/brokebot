import React from "react";
import { Separator } from "@/components/ui/separator";
import { DataStorageSection } from "./privacy/data-storage-section";
import { LegalSection } from "./privacy/legal-section";
import { DataManagementSection } from "./privacy/data-management-section";
import { DangerZoneSection } from "./privacy/danger-zone-section";
import { ClearAllDataDialog, ResetSettingsDialog } from "./privacy/confirmation-dialogs";
import { usePrivacySettings } from "@/features/settings/hooks/use-privacy-settings";

interface PrivacyTabProps {
  hasConversations?: boolean;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ hasConversations = false }) => {
  const {
    hasConversations: hasConversationsFromHook,
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
  } = usePrivacySettings(hasConversations);

  return (
    <>
      <div className="space-y-6">
        <DataStorageSection />

        <Separator />

        <LegalSection />

        <Separator />

        <DataManagementSection
          fileInputRef={fileInputRef}
          onExportConversations={handleExportConversations}
          onImportClick={handleImportClick}
          onFileImport={handleFileImport}
          hasConversations={hasConversationsFromHook}
        />

        <Separator />

        <DangerZoneSection
          onClearAllDataClick={() => setShowClearDataDialog(true)}
          hasConversations={hasConversationsFromHook}
        />
      </div>

      <ClearAllDataDialog
        open={showClearDataDialog}
        onConfirm={handleClearAllDataConfirm}
        onCancel={() => setShowClearDataDialog(false)}
      />

      <ResetSettingsDialog
        open={showResetSettingsDialog}
        onConfirm={handleResetSettingsConfirm}
        onCancel={() => setShowResetSettingsDialog(false)}
      />
    </>
  );
}
