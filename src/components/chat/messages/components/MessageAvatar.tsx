import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Loader2 } from "lucide-react";

interface MessageAvatarProps {
  isUser: boolean;
  isGenerating?: boolean;
  position: "left" | "right";
}

/**
 * Avatar component for messages
 */
export const MessageAvatar: React.FC<MessageAvatarProps> = ({
  isUser,
  isGenerating = false,
  position,
}) => {
  const className = `w-8 h-8 mt-1 ${position === "left" ? "mr-3" : "ml-3"}`;

  return (
    <Avatar className={className}>
      <AvatarImage src="" />
      <AvatarFallback
        className={
          isUser
            ? "bg-primary text-primary-foreground text-xs"
            : "bg-muted text-muted-foreground text-xs"
        }
      >
        {isUser ? (
          "💸"
        ) : isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "🤖"
        )}
      </AvatarFallback>
    </Avatar>
  );
};
