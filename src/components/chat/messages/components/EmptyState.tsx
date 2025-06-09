import React from "react";
import type { IConversation } from "../../../../lib/db";

interface EmptyStateProps {
  conversation?: IConversation;
}

/**
 * Empty state when no messages are present
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ conversation }) => {
  return (
    <div className="text-center text-muted-foreground py-12">
      <div className="text-4xl mb-4">💸</div>
      <h3 className="text-lg font-semibold mb-2">
        {conversation ? `Chat: ${conversation.title}` : "Welcome to Local-GPT!"}
      </h3>
      <p className="text-sm">
        {conversation
          ? "Start chatting with your AI assistant."
          : "Start a conversation with your free AI assistant."}
      </p>
    </div>
  );
};
