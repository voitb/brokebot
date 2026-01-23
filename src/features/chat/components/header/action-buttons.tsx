import {
  Star,
  Sun,
  Moon,
  Settings,
  Keyboard,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionButtonsProps {
  theme: string;
  conversationId?: string;
  isConversationPinned?: boolean;
  showShortcuts?: boolean;
  onToggleTheme: () => void;
  onTogglePinConversation: () => Promise<void>;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenExport: () => void;
  onImportConversation: () => void;
}

export function ActionButtons({
  theme,
  conversationId,
  isConversationPinned = false,
  showShortcuts = true,
  onToggleTheme,
  onTogglePinConversation,
  onOpenSettings,
  onOpenShortcuts,
  onOpenExport,
  onImportConversation,
}: ActionButtonsProps) {
  return (
    <>
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
            <Button variant="ghost" size="sm" onClick={onOpenExport}>
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export conversation</p>
          </TooltipContent>
        </Tooltip>
      )}

      {conversationId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onImportConversation}>
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import conversation</p>
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      {showShortcuts && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onOpenShortcuts}>
              <Keyboard className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard shortcuts (?)</p>
          </TooltipContent>
        </Tooltip>
      )}

      {conversationId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onTogglePinConversation}>
              <Star
                className={`w-4 h-4 ${
                  isConversationPinned ? "fill-current text-yellow-500" : ""
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isConversationPinned ? "Unpin" : "Pin"} conversation{" "}
              {showShortcuts ? "(g p)" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
