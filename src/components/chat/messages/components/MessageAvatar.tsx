import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Loader2 } from "lucide-react";

interface MessageAvatarProps {
  isUser: boolean;
  isGenerating?: boolean;
  position: "left" | "right";
}

/**
 * Avatar content based on user type and state
 */
const AvatarContent: React.FC<{ isUser: boolean; isGenerating: boolean }> = React.memo(({ 
  isUser, 
  isGenerating 
}) => {
  if (isUser) {
    return <>💸</>;
  }

  return <>🤖</>;
});

/**
 * Avatar component for messages
 */
export const MessageAvatar: React.FC<MessageAvatarProps> = React.memo(({
  isUser,
  isGenerating = false,
  position,
}) => {
  const className = `w-8 h-8 mt-1 ${position === "left" ? "mr-3" : "ml-3"}`;
  const fallbackClassName = isUser
    ? "bg-primary text-primary-foreground text-xs"
    : "bg-muted text-muted-foreground text-xs";

  return (
    <Avatar className={className}>
      <AvatarImage src="" />
      <AvatarFallback className={fallbackClassName}>
        <AvatarContent isUser={isUser} isGenerating={isGenerating} />
      </AvatarFallback>
    </Avatar>
  );
});
