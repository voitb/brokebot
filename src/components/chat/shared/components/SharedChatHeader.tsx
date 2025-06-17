import React from "react";
import { Copy, Download, FileCode, Moon, Sun } from "lucide-react";
import { Separator } from "../../../ui/separator";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import type { ISharedLink } from "../../../../lib/db";
import { Logo } from "../../../ui/Logo";

interface SharedChatHeaderProps {
  theme: "light" | "dark";
  sharedLink: ISharedLink;
  onToggleTheme: () => void;
  onCopyLink: () => void;
  onDownloadChat: () => void;
  onLogoClick: () => void;
  onDownloadHtmlPage: () => void;
}

export const SharedChatHeader: React.FC<SharedChatHeaderProps> = ({
  theme,
  sharedLink,
  onToggleTheme,
  onCopyLink,
  onDownloadChat,
  onLogoClick,
  onDownloadHtmlPage,
}) => {
  return (
    <header className="bg-background sticky top-0 z-10 shrink-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Logo size="md" /> 
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadHtmlPage}
                >
                  <FileCode className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download page (.html)</p>
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
                  <p>Download chat (.json)</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 