import { Separator } from "../../../ui/separator";
import {
  DataStorageSection,
  LegalSection,
  DataManagementSection,
  DangerZoneSection,
  ManualSyncSection,
  ClearAllDataDialog,
  ResetSettingsDialog,
  usePrivacySettings,
} from "./privacy";
import { useManualSync } from "../../../../hooks/business/useManualSync";

interface UserInfo {
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface PrivacyTabProps {
  userInfo?: UserInfo;
  hasConversations?: boolean;
}

/**
 * Privacy settings tab with data storage, import/export, and danger zone
 */
export function PrivacyTab({
  userInfo,
  hasConversations = false,
}: PrivacyTabProps) {
  const {
    // State
    config,
    hasActiveSubscription,
    hasConversations: hasConversationsFromHook,
    showClearDataDialog,
    showResetSettingsDialog,
    fileInputRef,

    // Actions
    handleToggleLocalStorage,
    handleToggleCloudStorage,
    handleClearAllDataConfirm,
    handleResetSettingsConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,

    // Dialog controls
    setShowClearDataDialog,
    setShowResetSettingsDialog,
  } = usePrivacySettings(userInfo, hasConversations);

  const { isUploading, isDownloading, handleUpload, handleDownload } = useManualSync();

  return (
    <>
      <div className="space-y-6">
        <DataStorageSection
          storeConversationsLocally={config.storeConversationsLocally}
          storeConversationsInCloud={config.storeConversationsInCloud || false}
          hasActiveSubscription={hasActiveSubscription}
          onToggleLocalStorage={handleToggleLocalStorage}
          onToggleCloudStorage={handleToggleCloudStorage}
        />

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

        <ManualSyncSection
          isSyncEnabled={hasActiveSubscription}
          isUploading={isUploading}
          isDownloading={isDownloading}
          onUpload={handleUpload}
          onDownload={handleDownload}
        />

        <DangerZoneSection
          onClearAllDataClick={() => setShowClearDataDialog(true)}
          onResetSettingsClick={() => setShowResetSettingsDialog(true)}
          hasConversations={hasConversationsFromHook}
        />
      </div>

      {/* Confirmation Dialogs */}
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
