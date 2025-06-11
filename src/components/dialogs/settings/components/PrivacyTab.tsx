import { Separator } from "../../../ui/separator";
import {
  DataStorageSection,
  LegalSection,
  DataManagementSection,
  DangerZoneSection,
  ClearAllDataDialog,
  ResetSettingsDialog,
  usePrivacySettings,
} from "./privacy";

interface UserInfo {
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface PrivacyTabProps {
  userInfo?: UserInfo;
}

/**
 * Privacy settings tab with data storage, import/export, and danger zone
 */
export function PrivacyTab({ userInfo }: PrivacyTabProps) {
  const {
    // State
    config,
    hasActiveSubscription,
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
  } = usePrivacySettings(userInfo);

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
        />

        <DangerZoneSection
          onClearAllDataClick={() => setShowClearDataDialog(true)}
          onResetSettingsClick={() => setShowResetSettingsDialog(true)}
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
