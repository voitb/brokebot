"use client";

import React from "react";
import { Shield, CreditCard, X, Check, Loader2, Settings, LogIn, LogOut, FileText } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/providers/AuthProvider";
import { useSubscription } from "@/hooks/business/useSubscription";
import { BillingTab } from './components/BillingTab';
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationItems = [
  { id: "general" as const, label: "General", icon: Settings },
  { id: "documents" as const, label: "Documents", icon: FileText },
  { id: "privacy" as const, label: "Privacy", icon: Shield },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Pobierz aktywny tab z URL, domyślnie "general"
  const activeTab = (searchParams.get("tab") as SettingsTab) || "general";
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  
  const {
    settings,
    isSaving,
    handleFieldChange,
    handleSaveChanges,
  } = useSettings();
  const { conversations } = useConversations();
  const { user, logout } = useAuth();
  const { hasActiveSubscription, subscription, checkSubscriptionStatus } = useSubscription();

  // Obsługa sukcesu płatności
  React.useEffect(() => {
    if (status === "success" && sessionId) {
      toast.success("Payment successful! Your subscription is now active.", {
        duration: 5000,
      });
      
      // Odśwież status subskrypcji
      checkSubscriptionStatus();
      
      // Usuń parametry status i session_id z URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("status");
      newParams.delete("session_id");
      setSearchParams(newParams);
    }
  }, [status, sessionId, checkSubscriptionStatus, searchParams, setSearchParams]);

  const setActiveTab = (tab: SettingsTab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  const handleSaveAndClose = async () => {
    await handleSaveChanges();
    onOpenChange(false);
  };

  const getTabDisplayName = (tabId: SettingsTab) =>
    navigationItems.find((item) => item.id === tabId)?.label || tabId;

  const hasConversations = conversations && conversations.length > 0;
  const userInfo = {
    isLoggedIn: !!user,
    hasActiveSubscription: hasActiveSubscription,
    subscriptionPlan: subscription?.planId ?? "Free",
    subscriptionStatus: subscription?.status ?? "None",
  };

  const renderTabContent = () => {
    const commonProps = { settings, onFieldChange: handleFieldChange };
    switch (activeTab) {
      case "general":
        return <GeneralTab {...commonProps} />;
      case "documents":
        return <DocumentsTab />;
      case "privacy":
        return (
          <PrivacyTab
            userInfo={userInfo}
            hasConversations={hasConversations}
          />
        );
      case "billing":
        return <BillingTab />;
      default:
        return null;
    }
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[90vw] p-0 overflow-hidden md:max-h-[720px] md:w-[98vw] md:max-w-5xl">
        <TooltipProvider>
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Customize your Local-GPT settings here.
          </DialogDescription>

          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col h-[90vh]">
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
            <ScrollArea className="h-[calc(100%-150px)]">
              <div className="p-4">{renderTabContent()}</div>
            </ScrollArea>
            <div className="shrink-0 p-4 bg-muted/20 flex flex-row justify-between gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (user) {
                    logout();
                  } else {
                    navigate('/login');
                  }
                }}
                className="flex items-center gap-2"
              >
                {user ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSaveAndClose}
                      disabled={isSaving}
                      size="icon"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSaving ? "Saving..." : "Save Changes"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                          <SidebarMenuButton
                            asChild
                            isActive={activeTab === id}
                          >
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
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (user) {
                        logout();
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="flex items-center gap-2 mr-2"
                  >
                    {user ? (
                      <>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        <span>Login</span>
                      </>
                    )}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        size="icon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSaveAndClose}
                        disabled={isSaving}
                        size="icon"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSaving ? "Saving..." : "Save Changes"}</p>
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
