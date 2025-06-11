import React, { useState } from "react";
import { Copy, Link2, Globe, Lock, ExternalLink, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Alert, AlertDescription } from "../../ui/alert";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { useSharedLinks } from "../../../hooks/useSharedLinks";
import { useUserConfig } from "../../../hooks/useUserConfig";
import { toast } from "sonner";

interface ShareChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
}

/**
 * Modal for sharing chat conversations
 */
export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  open,
  onOpenChange,
  conversationId,
}) => {
  const { conversation, messages } = useConversation(conversationId);
  const { createSharedLink } = useSharedLinks();
  const { config } = useUserConfig();

  const [shareOptions, setShareOptions] = useState({
    allowDownload: true,
    showSharedBy: false,
    anonymizeMessages: false,
    publicDiscovery: false,
  });
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  // Check subscription for premium features
  const hasActiveSubscription = false; // Mock - replace with real subscription check
  const canPublicShare = hasActiveSubscription;

  // Check if user has cloud storage enabled (for info only)
  const hasCloudStorage =
    config.storeConversationsInCloud && config.storeConversationsLocally;

  const handleGenerateShareLink = async () => {
    if (!conversation || !messages.length) {
      toast.error("No conversation to share");
      return;
    }

    setIsGeneratingLink(true);

    try {
      // Create shared link with options
      const newShareId = await createSharedLink(
        conversation.id,
        conversation.title,
        shareOptions
      );

      if (newShareId) {
        setShareId(newShareId);
        toast.success("Share link generated successfully!");
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error("Failed to generate share link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareId) return;

    const shareLink = `${window.location.origin}/share/${shareId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const getShareLink = () => {
    if (!shareId) return "";
    return `${window.location.origin}/share/${shareId}`;
  };

  if (!conversation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Chat</DialogTitle>
            <DialogDescription>No conversation selected</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const shareLink = getShareLink();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share Conversation
          </DialogTitle>
          <DialogDescription>
            Share "{conversation.title}" with others
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 h-[calc(80vh-150px)]">
            {/* Storage Info */}
            {!hasCloudStorage && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Local sharing only</p>
                  <p className="text-sm">
                    This conversation is stored locally. The share link will
                    work as long as your browser data is preserved. Enable cloud
                    storage in Privacy settings for persistent sharing.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Conversation Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Conversation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Messages:</span>
                  <Badge variant="outline">{messages.length} messages</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{conversation.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage:</span>
                  <div className="flex items-center gap-1">
                    {hasCloudStorage ? (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Cloud + Local
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        Local Only
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-1">
                    {shareLink ? (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Shared
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Share Settings</CardTitle>
                <CardDescription>
                  Configure privacy options for shared conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Allow download
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow viewers to download this conversation
                    </p>
                  </div>
                  <Switch
                    checked={shareOptions.allowDownload}
                    onCheckedChange={(checked) =>
                      setShareOptions((prev) => ({
                        ...prev,
                        allowDownload: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Show shared by
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Display who shared this conversation
                    </p>
                  </div>
                  <Switch
                    checked={shareOptions.showSharedBy}
                    onCheckedChange={(checked) =>
                      setShareOptions((prev) => ({
                        ...prev,
                        showSharedBy: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Anonymize messages
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Remove personal information from shared content
                    </p>
                  </div>
                  <Switch
                    checked={shareOptions.anonymizeMessages}
                    onCheckedChange={(checked) =>
                      setShareOptions((prev) => ({
                        ...prev,
                        anonymizeMessages: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Public discovery
                      <Crown className="h-3 w-3 text-amber-500" />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to discover this conversation (Premium only)
                    </p>
                  </div>
                  <Switch
                    checked={shareOptions.publicDiscovery}
                    onCheckedChange={(checked) =>
                      setShareOptions((prev) => ({
                        ...prev,
                        publicDiscovery: checked,
                      }))
                    }
                    disabled={!canPublicShare}
                  />
                </div>

                {!hasActiveSubscription && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Upgrade to Premium for public discovery features
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Share Link Generation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Share Link
                </CardTitle>
                <CardDescription>
                  Generate a shareable link to this conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!shareLink ? (
                  <Button
                    onClick={handleGenerateShareLink}
                    disabled={isGeneratingLink}
                    className="w-full"
                  >
                    {isGeneratingLink ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating link...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Generate Share Link
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={shareLink}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(shareLink, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview Share
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t bg-background flex justify-end shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
