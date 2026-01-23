import type { Conversation } from "@/lib/db";
import { Logo } from "@/components/ui/logo";

interface EmptyStateProps {
  conversation?: Conversation;
}

export function EmptyState({ conversation }: EmptyStateProps) {
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
}
