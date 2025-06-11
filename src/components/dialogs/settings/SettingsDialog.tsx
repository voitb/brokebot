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
import { useConversations } from "../../../hooks/useConversations";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab =
  | "profile"
  | "privacy"
  | "integrations"
  | "models"
  | "billing";

// Mock user state - replace with real auth
const isUserLoggedIn = false;

// Mock subscription state - replace with real subscription check
const hasActiveSubscription = false;
const subscriptionPlan = hasActiveSubscription ? "Pro" : "Free";
const subscriptionStatus = hasActiveSubscription ? "Active" : "None";

// User info for settings
const userInfo = {
  isLoggedIn: isUserLoggedIn,
  hasActiveSubscription,
  subscriptionPlan,
  subscriptionStatus,
  // Add more user info as needed
};

const navigationItems = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "models" as const, label: "AI Models", icon: Bot },
  { id: "integrations" as const, label: "Integrations", icon: Plug },
  { id: "privacy" as const, label: "Privacy", icon: Shield },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");
  const { conversations } = useConversations();

  // Check if user has any conversations for disabling certain options
  const hasConversations = conversations && conversations.length > 0;

  const getTabDisplayName = (tabId: SettingsTab) => {
    const tab = navigationItems.find((item) => item.id === tabId);
    return tab?.label || tabId;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "models":
        return <ModelsTab />;
      case "integrations":
        return <IntegrationsTab userInfo={userInfo} />;
      case "privacy":
        return (
          <PrivacyTab userInfo={userInfo} hasConversations={hasConversations} />
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] p-0 overflow-hidden md:max-h-[720px] md:w-[98vw] md:max-w-5xl">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your Local-GPT settings here.
        </DialogDescription>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col h-full">
          {/* Mobile Header with Navigation */}
          <div className="shrink-0 p-4 space-y-4 bg-background">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className="flex items-center gap-2 justify-start"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mobile Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">{renderTabContent()}</div>
          </ScrollArea>

          {/* Mobile Footer */}
          <div className="shrink-0 p-4 bg-muted/20 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <SidebarProvider className="items-start h-full min-h-0">
          <Sidebar collapsible="none" className="flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={activeTab === item.id}
                          >
                            <button onClick={() => setActiveTab(item.id)}>
                              <Icon />
                              <span>{item.label}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-full flex-1 flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
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
            </header>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 max-w-none">{renderTabContent()}</div>
              </ScrollArea>
            </div>
            <div className="shrink-0 px-4 py-3 flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
