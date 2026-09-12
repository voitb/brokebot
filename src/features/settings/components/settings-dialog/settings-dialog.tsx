import { Shield, Settings, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { GeneralTab } from "../general-tab";
import { DocumentsTab } from "../documents-tab";
import { PrivacyTab } from "../privacy-tab";
import { SettingsMobileLayout } from "../settings-mobile-layout";
import { SettingsDesktopLayout } from "../settings-desktop-layout";
import { useSettings, isValidSettingsTab, type SettingsTab } from "./use-settings";
import { useIsMobile } from "@/hooks/use-is-mobile";
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

  const { settings, isSaving, handleFieldChange, handleSaveChanges } = useSettings();
  const isMobile = useIsMobile();

  const setActiveTab = (tab: SettingsTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  const handleClose = () => onOpenChange(false);

  const commonProps = { settings, onFieldChange: handleFieldChange };

  const tabContent = (
    <ErrorBoundary>
      {activeTab === "general" && <GeneralTab {...commonProps} onSaveChanges={handleSaveChanges} isSaving={isSaving} />}
      {activeTab === "documents" && <DocumentsTab />}
      {activeTab === "privacy" && <PrivacyTab />}
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
          {isMobile ? (
            <SettingsMobileLayout {...layoutProps} />
          ) : (
            <SettingsDesktopLayout {...layoutProps} />
          )}
      </DialogContent>
    </Dialog>
  );
}
