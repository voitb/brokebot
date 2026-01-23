import type { LucideIcon } from "lucide-react";
import type { SettingsTab } from "./settings-dialog/use-settings";

export interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

export interface SettingsLayoutProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
  tabs: SettingsNavItem[];
  children: React.ReactNode;
}
