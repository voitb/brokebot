import React from "react";
import { MessageSquare } from "lucide-react";
import { MessageBubble } from "../../messages/components";
import type { Message } from "../../../../lib/db";

interface SharedChatMessagesProps {
  messages: Message[];
}

export const SharedChatMessages: React.FC<SharedChatMessagesProps> = ({
  messages,
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          No messages in this conversation.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          This shared chat is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLastMessage={index === messages.length - 1}
        />
      ))}
    </div>
  );
}; 