import { Star, Sun, Moon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HeaderActionsMenu } from "./header-actions-menu";
import { cn } from "@/lib/cn";

interface HeaderActionsProps {
  conversationId: string | undefined;
  isPinned: boolean;
  theme: string;
  onToggleTheme: () => void;
  onTogglePin: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenExport: () => void;
  onImportConversation: () => void;
  onDeleteConversation: () => void;
  className?: string;
}

export function HeaderActions({
  conversationId,
  isPinned,
  theme,
  onToggleTheme,
  onTogglePin,
  onOpenSettings,
  onOpenShortcuts,
  onOpenExport,
  onImportConversation,
  onDeleteConversation,
  className,
}: HeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onToggleTheme}>
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle theme</p>
        </TooltipContent>
      </Tooltip>

      {conversationId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onTogglePin}>
              <Star
                className={cn(
                  "w-4 h-4",
                  isPinned && "fill-current text-yellow-500"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPinned ? "Unpin" : "Pin"} conversation</p>
          </TooltipContent>
        </Tooltip>
      )}

      <HeaderActionsMenu
        conversationId={conversationId}
        onOpenSettings={onOpenSettings}
        onOpenShortcuts={onOpenShortcuts}
        onOpenExport={onOpenExport}
        onImportConversation={onImportConversation}
        onDeleteConversation={onDeleteConversation}
      />
    </div>
  );
}
