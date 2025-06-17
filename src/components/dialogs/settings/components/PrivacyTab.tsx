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
    // config,
    // hasActiveSubscription,
    hasConversations: hasConversationsFromHook,
    showClearDataDialog,
    showResetSettingsDialog,
    fileInputRef,
 
    // handleToggleCloudStorage,
    handleClearAllDataConfirm,
    handleResetSettingsConfirm,
    handleExportConversations,
    handleImportClick,
    handleFileImport,

    // Dialog controls
    setShowClearDataDialog,
    setShowResetSettingsDialog,
  } = usePrivacySettings(userInfo, hasConversations);

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
          // onResetSettingsClick={() => setShowResetSettingsDialog(true)}
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
