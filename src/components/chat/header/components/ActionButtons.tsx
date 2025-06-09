import React from "react";
import { Star, Sun, Moon, Settings, Keyboard } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";

interface ActionButtonsProps {
  theme: string;
  conversationId?: string;
  isConversationPinned?: boolean;
  showShortcuts?: boolean;
  onToggleTheme: () => void;
  onTogglePinConversation: () => Promise<void>;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

/**
 * Reusable action buttons for header - theme, settings, shortcuts, pin
 * Can be configured to show/hide certain buttons based on context
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  theme,
  conversationId,
  isConversationPinned = false,
  showShortcuts = true,
  onToggleTheme,
  onTogglePinConversation,
  onOpenSettings,
  onOpenShortcuts,
}) => {
  return (
    <>
      {/* Theme Toggle Button */}
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

      {/* Settings Button */}
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

      {/* Shortcuts Button (conditional) */}
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

      {/* Star/Pin Button (conditional) */}
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
              {showShortcuts ? "(Alt+P)" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
};
