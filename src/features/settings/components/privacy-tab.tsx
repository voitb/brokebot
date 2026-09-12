import { Separator } from "@/components/ui/separator";
import { DataStorageSection } from "./privacy/data-storage-section";
import { LegalSection } from "./privacy/legal-section";
import { DataManagementSection } from "./privacy/data-management-section";
import { DangerZoneSection } from "./privacy/danger-zone-section";
import { ClearAllDataDialog } from "./privacy/confirmation-dialogs";
import { usePrivacySettings } from "./privacy/use-privacy-settings";

export function PrivacyTab() {
  const {
    hasApiKey,
    hasConversations,
    hasDocuments,
    hasFolders,
    showClearDataDialog,
    fileInputRef,
    handleClearAllDataConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,
    setShowClearDataDialog,
  } = usePrivacySettings();

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
          hasConversations={hasConversations}
        />

        <Separator />

        <DangerZoneSection
          onClearAllDataClick={() => setShowClearDataDialog(true)}
          hasConversations={hasConversations}
          hasDocuments={hasDocuments}
          hasFolders={hasFolders}
          hasApiKey={hasApiKey}
        />
      </div>

      <ClearAllDataDialog
        open={showClearDataDialog}
        onConfirm={handleClearAllDataConfirm}
        onCancel={() => setShowClearDataDialog(false)}
      />
    </>
  );
}
