"use client";

import React from "react";
import { User, Shield, CreditCard, Plug, Bot } from "lucide-react";
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
  ProfileTab,
  ModelsTab,
  IntegrationsTab,
  PrivacyTab,
  LocalUserBillingTab,
  LoggedUserBillingTab,
} from "./components";
import { useSettings, type SettingsTab } from "./hooks/useSettings";
import { useConversations } from "@/hooks/useConversations";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "models" as const, label: "Local Models", icon: Bot },
  { id: "integrations" as const, label: "Integrations", icon: Plug },
  { id: "privacy" as const, label: "Privacy", icon: Shield },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

// Mock user state - will be moved to a proper auth provider
const isUserLoggedIn = false;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const {
    settings,
    isSaving,
    activeTab,
    setActiveTab,
    handleFieldChange,
    handleSaveChanges,
  } = useSettings();
  const { conversations } = useConversations();

  const handleSaveAndClose = async () => {
    await handleSaveChanges();
    onOpenChange(false);
  };

  const hasConversations = conversations && conversations.length > 0;
  // This should come from a proper auth context in the future
  const userInfo = {
    isLoggedIn: isUserLoggedIn,
    hasActiveSubscription: false,
    subscriptionPlan: "Free",
    subscriptionStatus: "None",
  };

  const getTabDisplayName = (tabId: SettingsTab) =>
    navigationItems.find((item) => item.id === tabId)?.label || tabId;

  const renderTabContent = () => {
    const commonProps = { settings, onFieldChange: handleFieldChange };
    switch (activeTab) {
      case "profile":
        return <ProfileTab {...commonProps} />;
      case "models":
        return <ModelsTab {...commonProps} />;
      case "integrations":
        return <IntegrationsTab {...commonProps} userInfo={userInfo} />;
      case "privacy":
        return (
          <PrivacyTab
            {...commonProps}
            userInfo={userInfo}
            hasConversations={hasConversations}
          />
        );
      case "billing":
        return isUserLoggedIn ? (
          <LoggedUserBillingTab userInfo={userInfo} />
        ) : (
          <LocalUserBillingTab />
        );
      default:
        return null;
    }
  };

  if (!settings) return null; // Or a loading state

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] p-0 overflow-hidden md:max-h-[720px] md:w-[98vw] md:max-w-5xl">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your Local-GPT settings here.
        </DialogDescription>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col h-full">
          <div className="shrink-0 p-4 space-y-4 bg-background">
            <h2 className="text-lg font-semibold">Settings</h2>
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
          <ScrollArea className="flex-1">
            <div className="p-4">{renderTabContent()}</div>
          </ScrollArea>
          <div className="shrink-0 p-4 bg-muted/20 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAndClose}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
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
                      <BreadcrumbPage>
                        {getTabDisplayName(activeTab)}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-auto flex items-center gap-2 px-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAndClose} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </header>
            <ScrollArea className="h-full">
              <div className="p-6">{renderTabContent()}</div>
            </ScrollArea>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
