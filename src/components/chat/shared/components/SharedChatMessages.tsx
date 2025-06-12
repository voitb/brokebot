import React from "react";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { MessageBubble } from "../../messages/components";
import type { Message } from "../../../../lib/db";

interface SharedChatMessagesProps {
  messages: Message[];
}

export const SharedChatMessages: React.FC<SharedChatMessagesProps> = ({
  messages,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conversation</CardTitle>
        <CardDescription>
          This conversation was shared from Local-GPT
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No messages in this conversation
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 