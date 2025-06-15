import React from "react";
import { Calendar, MessageSquare } from "lucide-react";
import type { Conversation, Message, ISharedLink } from "../../../../lib/db";

interface SharedChatInfoProps {
  conversation: Conversation;
  messages: Message[];
  sharedLink: ISharedLink;
}

export const SharedChatInfo: React.FC<SharedChatInfoProps> = ({
  conversation,
  messages,
  sharedLink,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold break-words tracking-tight">
          {conversation.title}
        </h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              Shared on {sharedLink.createdAt.toLocaleDateString()}
            </span>
          </span>
          <span className="hidden sm:inline-block text-xs">•</span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </span>
        </div>
      </div>
      {sharedLink.showSharedBy && (
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-muted-foreground">Shared by</p>
          <p className="font-medium text-sm">Anonymous User</p>
        </div>
      )}
    </div>
  );
}; 
 