import React from "react";
import { ExternalLink, Calendar, MessageSquare, Copy, Download } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../ui/tooltip";
import { MessageBubble } from "../messages/components";
import type { IConversation, IMessage } from "../../../lib/db";
import { toast } from "sonner";

interface SharedChatLayoutProps {
  conversation: IConversation;
  messages: IMessage[];
  shareId: string;
  viewCount?: number;
  isPublic?: boolean;
  sharedBy?: string;
  sharedAt?: Date;
}

/**
 * Standalone layout for viewing shared chat conversations
 */
export const SharedChatLayout: React.FC<SharedChatLayoutProps> = ({
  conversation,
  messages,
  shareId,
  viewCount = 0,
  isPublic = false,
  sharedBy = "Anonymous",
  sharedAt = new Date(),
}) => {
  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadChat = () => {
    const chatData = {
      title: conversation.title,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
      metadata: {
        shareId,
        sharedBy,
        sharedAt: sharedAt.toISOString(),
        viewCount,
        isPublic,
      }
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat downloaded successfully!");
  };

  const handleOpenInApp = () => {
    const appUrl = window.location.origin;
    window.open(appUrl, '_blank');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Local-GPT</h1>
                    <p className="text-xs text-muted-foreground">Shared Conversation</p>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                <div className="flex items-center gap-2">
                  {isPublic && (
                    <Badge variant="default" className="text-xs">
                      Public
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {viewCount} views
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy share link</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownloadChat}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download chat</p>
                  </TooltipContent>
                </Tooltip>

                <Button onClick={handleOpenInApp} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open in App
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Chat Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{conversation.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Shared {sharedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {messages.length} messages
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Shared by</p>
                  <p className="font-medium">{sharedBy}</p>
                </div>
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
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages in this conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
              <MessageSquare className="w-4 h-4" />
              <span>Powered by Local-GPT</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleOpenInApp}>
                Try it yourself
              </Button>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}; 