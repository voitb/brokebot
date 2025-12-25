"use client";

import { Shield, X, Settings, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../../ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import {
  GeneralTab,
  DocumentsTab,
  PrivacyTab,
} from "./components";
import { useSettings, type SettingsTab } from "./hooks/useSettings";
import { useConversations } from "@/hooks/useConversations";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { id: "general" as const, label: "General", icon: Settings },
  { id: "documents" as const, label: "Documents", icon: FileText },
  { id: "privacy" as const, label: "Privacy", icon: Shield },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get("tab") as SettingsTab) || "general";

  const {
    settings,
    handleFieldChange,
    handleSaveChanges,
  } = useSettings();
  const { conversations } = useConversations();

  const setActiveTab = (tab: SettingsTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  const getTabDisplayName = (tabId: SettingsTab) =>
    navigationItems.find((item) => item.id === tabId)?.label || tabId;

  const hasConversations = conversations && conversations.length > 0;

  const renderTabContent = () => {
    const commonProps = { settings, onFieldChange: handleFieldChange };
    switch (activeTab) {
      case "general":
        return <GeneralTab {...commonProps} onSaveChanges={handleSaveChanges} />;
      case "documents":
        return <DocumentsTab />;
      case "privacy":
        return <PrivacyTab hasConversations={hasConversations} />;
      default:
        return null;
    }
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="h-[90vh] w-[90vw] p-0 overflow-hidden md:max-h-[720px] md:w-[98vw] md:max-w-5xl">
        <TooltipProvider>
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Customize your brokebot settings here.
          </DialogDescription>

          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col h-[90vh]">
            <div className="shrink-0 p-4 space-y-4 bg-background">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={activeTab === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(id)}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-150px)]">
              <div className="p-4">{renderTabContent()}</div>
            </ScrollArea>
            <div className="shrink-0 p-4 border-t flex justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={() => onOpenChange(false)} size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Desktop Layout */}
          <SidebarProvider className="items-start h-full min-h-0 hidden md:flex">
            <Sidebar collapsible="none" className="flex">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map(({ id, label, icon: Icon }) => (
                        <SidebarMenuItem key={id}>
                          <SidebarMenuButton asChild isActive={activeTab === id}>
                            <button onClick={() => setActiveTab(id)}>
                              <Icon />
                              <span>{label}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <main className="flex h-full flex-1 flex-col">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink>Settings</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{getTabDisplayName(activeTab)}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="ml-auto flex items-center gap-2 px-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" onClick={() => onOpenChange(false)} size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </header>
              <ScrollArea className="h-[calc(100%-64px)]">
                <div className="p-6">{renderTabContent()}</div>
              </ScrollArea>
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
