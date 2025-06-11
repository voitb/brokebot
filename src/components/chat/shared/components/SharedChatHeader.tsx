import React from "react";
import { Copy, Download, MessageSquare, Moon, Sun } from "lucide-react";
import { Separator } from "../../../ui/separator";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import type { ISharedLink } from "../../../../lib/db";

interface SharedChatHeaderProps {
  theme: "light" | "dark";
  sharedLink: ISharedLink;
  onToggleTheme: () => void;
  onCopyLink: () => void;
  onDownloadChat: () => void;
  onLogoClick: () => void;
}

export const SharedChatHeader: React.FC<SharedChatHeaderProps> = ({
  theme,
  sharedLink,
  onToggleTheme,
  onCopyLink,
  onDownloadChat,
  onLogoClick,
}) => {
  return (
    <header className="bg-background border-b sticky top-0 z-10 shrink-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Local-GPT</h1>
                <p className="text-xs text-muted-foreground">
                  Shared Conversation
                </p>
              </div>
            </button>

            <Separator
              orientation="vertical"
              className="h-8 hidden sm:block"
            />

            <div className="flex items-center gap-2">
              {sharedLink.publicDiscovery && (
                <Badge variant="default" className="text-xs">
                  Public
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {sharedLink.viewCount} views
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onToggleTheme}>
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy share link</p>
              </TooltipContent>
            </Tooltip>

            {sharedLink.allowDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadChat}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download chat</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 