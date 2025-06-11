import React from "react";
import { ConversationItem } from "./ConversationItem";
import type { Conversation } from "../../../../lib/db";

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
}

/**
 * Group of conversations with a title header
 */
export const ConversationGroup: React.FC<ConversationGroupProps> = ({
  title,
  conversations,
}) => {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xs text-muted-foreground font-semibold mb-2 px-2">
        {title}
      </h2>
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
}; 