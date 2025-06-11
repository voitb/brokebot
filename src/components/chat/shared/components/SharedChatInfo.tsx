import React from "react";
import { Calendar, MessageSquare } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl break-words">
              {conversation.title}
            </CardTitle>
            <CardDescription className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Shared {sharedLink.createdAt.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {messages.length} messages
              </span>
            </CardDescription>
          </div>
          {sharedLink.showSharedBy && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Shared by</p>
              <p className="font-medium">Anonymous User</p>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}; 
 