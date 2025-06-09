import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import type { IMessage } from "../../../../lib/db";

interface MessageBubbleProps {
  message: IMessage;
}

/**
 * Individual message bubble with avatar and content
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Avatar for AI */}
      {!isUser && (
        <Avatar className="w-8 h-8 mr-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            🤖
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xl ${isUser ? "ml-auto" : ""}`}>
        {/* Message Content */}
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <div
          className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <Badge variant="outline" className="text-xs">
            {message.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && (
        <Avatar className="w-8 h-8 ml-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            💸
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
