import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SharedChatLayout } from "../components/chat/shared/SharedChatLayout";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { db, type IConversation, type IMessage } from "../lib/db";

interface SharedChatData {
  conversation: IConversation;
  messages: IMessage[];
  shareId: string;
  viewCount: number;
  isPublic: boolean;
  sharedBy: string;
  sharedAt: Date;
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

        // Find conversation by shareId in database
        const conversations = await db.conversations.toArray();
        const sharedConversation = conversations.find(
          (conv) => conv.shareId === shareId
        );

        if (!sharedConversation) {
          setError("Shared conversation not found or link may have expired");
          setLoading(false);
          return;
        }

        // Create shared chat data
        const sharedData: SharedChatData = {
          conversation: sharedConversation,
          messages: sharedConversation.messages,
          shareId,
          viewCount: Math.floor(Math.random() * 100) + 10, // Mock view count
          isPublic: Math.random() > 0.5, // Mock public status
          sharedBy: "User", // Mock shared by
          sharedAt: sharedConversation.updatedAt,
        };

        // Increment mock view count
        sharedData.viewCount += 1;

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
            <a href="/" className="text-primary hover:underline">
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
      shareId={data.shareId}
      viewCount={data.viewCount}
      isPublic={data.isPublic}
      sharedBy={data.sharedBy}
      sharedAt={data.sharedAt}
    />
  );
};
