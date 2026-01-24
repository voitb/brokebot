import { Shield, Settings, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/error-boundary";
import { GeneralTab } from "../general-tab";
import { DocumentsTab } from "../documents-tab";
import { PrivacyTab } from "../privacy-tab";
import { SettingsMobileLayout } from "../settings-mobile-layout";
import { SettingsDesktopLayout } from "../settings-desktop-layout";
import { useSettings, isValidSettingsTab, type SettingsTab } from "./use-settings";
import { useConversations } from "@/hooks/use-conversations";
import type { SettingsNavItem } from "../settings-layout-types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAVIGATION_ITEMS: SettingsNavItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "privacy", label: "Privacy", icon: Shield },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTab = isValidSettingsTab(tabParam) ? tabParam : "general";

  const { settings, handleFieldChange, handleSaveChanges } = useSettings();
  const { conversations } = useConversations();

  const setActiveTab = (tab: SettingsTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  const handleClose = () => onOpenChange(false);

  if (!settings) return null;

  const hasConversations = conversations && conversations.length > 0;
  const commonProps = { settings, onFieldChange: handleFieldChange };

  const tabContent = (
    <ErrorBoundary>
      {activeTab === "general" && <GeneralTab {...commonProps} onSaveChanges={handleSaveChanges} />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "privacy" && <PrivacyTab hasConversations={hasConversations} />}
    </ErrorBoundary>
  );

  const layoutProps = {
    activeTab,
    onTabChange: setActiveTab,
    onClose: handleClose,
    tabs: NAVIGATION_ITEMS,
    children: tabContent,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-[90vh] w-[90vw] p-0 overflow-hidden md:max-h-[720px] md:w-[98vw] md:max-w-5xl"
      >
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Customize your brokebot settings here.
          </DialogDescription>
          <SettingsMobileLayout {...layoutProps} />
          <SettingsDesktopLayout {...layoutProps} />
      </DialogContent>
    </Dialog>
  );
}
