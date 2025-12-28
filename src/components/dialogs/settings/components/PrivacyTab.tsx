import { Separator } from "@/components/ui/separator";
import {
  DataStorageSection,
  LegalSection,
  DataManagementSection,
  DangerZoneSection,
  ClearAllDataDialog,
  ResetSettingsDialog,
  usePrivacySettings,
} from "./privacy";

interface PrivacyTabProps {
  hasConversations?: boolean;
}

export function PrivacyTab({ hasConversations = false }: PrivacyTabProps) {
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
