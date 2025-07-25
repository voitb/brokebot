import React from "react";
import type { Conversation } from "../../../../lib/db";
import { Logo } from "../../../ui/Logo";

interface EmptyStateProps {
  conversation?: Conversation;
}

/**
 * Empty state when no messages are present
 */
export const EmptyState: React.FC<EmptyStateProps> = React.memo(({ conversation }) => {
  const title = conversation ? `Chat: ${conversation.title}` : "Welcome to brokebot!";
  const description = conversation
    ? "Start chatting with your AI assistant."
    : "Start a conversation with your free AI assistant.";

  return (
    <div className="text-center text-muted-foreground py-12">
      <div className="text-4xl mb-4 flex justify-center"><Logo size="lg" /></div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
});
