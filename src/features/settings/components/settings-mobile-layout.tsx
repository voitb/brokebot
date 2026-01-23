import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SettingsLayoutProps } from "./settings-layout-types";

export function SettingsMobileLayout({
  activeTab,
  onTabChange,
  onClose,
  tabs,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex md:hidden flex-col h-[90vh]">
      <div className="shrink-0 p-4 space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(id)}
              className="flex items-center gap-2 justify-start"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-150px)]">
        <div className="p-4">{children}</div>
      </ScrollArea>
      <div className="shrink-0 p-4 border-t flex justify-end">
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
    </div>
  );
}
