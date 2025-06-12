import React from "react";
import { Link2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Alert, AlertDescription } from "../../ui/alert";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { useShareChat } from "./hooks/useShareChat";
import {
  ConversationInfo,
  ShareSettings,
  ShareLinkSection,
} from "./components";

interface ShareChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
}

/**
 * Modal for sharing chat conversations
 */
export const ShareChatModal: React.FC<ShareChatModalProps> = React.memo(
  ({ open, onOpenChange, conversationId }) => {
    const { conversation, messages } = useConversation(conversationId);
    const {
      shareOptions,
      setShareOptions,
      shareId,
      isGeneratingLink,
      hasActiveSubscription,
      hasCloudStorage,
      generateShareLink,
      handlePreviewShare,
    } = useShareChat({
      conversationId: conversation?.id,
      conversationTitle: conversation?.title,
    });

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
          <ScrollArea className="h-[calc(80vh-183px)]">
            <div className="space-y-6 px-6 py-4">
              {/* Storage Info */}
              {!hasCloudStorage && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Local sharing only</p>
                    <p className="text-sm">
                      This conversation is stored locally. The share link will
                      work as long as your browser data is preserved.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Conversation Info */}
              <ConversationInfo
                conversation={conversation}
                messagesCount={messages.length}
                hasCloudStorage={hasCloudStorage}
                isShared={!!shareId}
              />

              {/* Share Settings */}
              <ShareSettings
                shareOptions={shareOptions}
                onShareOptionsChange={setShareOptions}
                hasActiveSubscription={hasActiveSubscription}
              />

              {/* Share Link Generation */}
              <ShareLinkSection
                shareId={shareId}
                isGeneratingLink={isGeneratingLink}
                onGenerateLink={generateShareLink}
                onPreviewShare={handlePreviewShare}
              />
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
  }
);
