import React from "react";
import {
  Calendar,
  MessageSquare,
  Copy,
  Download,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../../ui/tooltip";
import { MessageBubble } from "../messages/components";
import type { IConversation, IMessage, ISharedLink } from "../../../lib/db";
import { toast } from "sonner";
import { useTheme } from "../../../providers/ThemeProvider";

interface SharedChatLayoutProps {
  conversation: IConversation;
  messages: IMessage[];
  sharedLink: ISharedLink;
}

/**
 * Standalone layout for viewing shared chat conversations
 */
export const SharedChatLayout: React.FC<SharedChatLayoutProps> = ({
  conversation,
  messages,
  sharedLink,
}) => {
  const { theme, setTheme } = useTheme();

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadChat = () => {
    if (!sharedLink.allowDownload) {
      toast.error("Download is not allowed for this conversation");
      return;
    }

    const chatData = {
      title: conversation.title,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
      metadata: {
        shareId: sharedLink.id,
        sharedAt: sharedLink.createdAt.toISOString(),
        viewCount: sharedLink.viewCount,
        isPublic: sharedLink.publicDiscovery,
      },
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_chat.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Chat downloaded successfully!");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogoClick = () => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    window.open(frontendUrl, "_blank");
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Fixed Header */}
        <header className="bg-background border-b sticky top-0 z-10 shrink-0">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogoClick}
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
                    <Button variant="outline" size="sm" onClick={toggleTheme}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                    >
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
                        onClick={handleDownloadChat}
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

        {/* Main Content with Single Scroll */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
              {/* Chat Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl break-words">
                        {conversation.title}
                      </CardTitle>
                      <CardDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Shared {sharedLink.createdAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {messages.length} messages
                        </span>
                      </CardDescription>
                    </div>
                    {sharedLink.showSharedBy && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Shared by
                        </p>
                        <p className="font-medium">Anonymous User</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation</CardTitle>
                  <CardDescription>
                    This conversation was shared from Local-GPT
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No messages in this conversation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <MessageSquare className="w-4 h-4" />
                  <span>Powered by Local-GPT</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={handleLogoClick}
                  >
                    Try it yourself
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
};
