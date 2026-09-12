import { X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SettingsLayoutProps } from "./settings-layout-types";

export function SettingsDesktopLayout({
  activeTab,
  onTabChange,
  onClose,
  tabs,
  children,
}: SettingsLayoutProps) {
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? activeTab;

  return (
    <SidebarProvider className="items-start h-full min-h-0 flex">
      <Sidebar collapsible="none" className="flex">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {tabs.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild isActive={activeTab === id}>
                      <button onClick={() => onTabChange(id)}>
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
                  <BreadcrumbPage>{activeTabLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={onClose} size="icon">
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
          <div className="p-6">{children}</div>
        </ScrollArea>
      </main>
    </SidebarProvider>
  );
}
