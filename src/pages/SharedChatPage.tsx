import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SharedChatLayout } from "../components/chat/shared/SharedChatLayout";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  db,
  type IConversation,
  type IMessage,
  type ISharedLink,
} from "../lib/db";

interface SharedChatData {
  conversation: IConversation;
  messages: IMessage[];
  sharedLink: ISharedLink;
}

/**
 * Page for viewing shared chat conversations
 * URL: /share/:shareId
 */
export const SharedChatPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      if (!shareId) {
        setError("Invalid share ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Find shared link in database
        const sharedLink = await db.sharedLinks.get(shareId);

        if (!sharedLink) {
          setError("Shared conversation not found or link may have expired");
          setLoading(false);
          return;
        }

        // Find the conversation
        const conversation = await db.conversations.get(
          sharedLink.conversationId
        );

        if (!conversation) {
          setError("Original conversation not found");
          setLoading(false);
          return;
        }

        // Increment view count
        await db.sharedLinks
          .where("id")
          .equals(shareId)
          .modify((link) => {
            link.viewCount += 1;
            link.updatedAt = new Date();
          });

        // Update local data with incremented view count
        const updatedSharedLink = {
          ...sharedLink,
          viewCount: sharedLink.viewCount + 1,
        };

        // Create shared chat data
        const sharedData: SharedChatData = {
          conversation,
          messages: conversation.messages,
          sharedLink: updatedSharedLink,
        };

        setData(sharedData);
      } catch (err) {
        console.error("Failed to fetch shared chat:", err);
        setError(
          "Failed to load shared conversation. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shareId]);

  // Invalid share ID
  if (!shareId) {
    return <Navigate to="/" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Loading shared conversation
            </h2>
            <p className="text-muted-foreground">
              Please wait while we fetch the chat...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <div className="space-y-2">
                <p className="font-medium">Unable to load conversation</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="text-center mt-6">
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
            <span className="mx-2 text-muted-foreground">or</span>
            <a
              href={import.meta.env.VITE_FRONTEND_URL || window.location.origin}
              className="text-primary hover:underline"
            >
              Go to Local-GPT
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render shared chat
  return (
    <SharedChatLayout
      conversation={data.conversation}
      messages={data.messages}
      sharedLink={data.sharedLink}
    />
  );
};
