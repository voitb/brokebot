import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageAvatarProps {
  isUser: boolean;
  position: "left" | "right";
}

export function MessageAvatar({
  isUser,
  position,
}: MessageAvatarProps) {
  const className = `w-8 h-8 mt-1 ${position === "left" ? "mr-3" : "ml-3"}`;
  const fallbackClassName = isUser
    ? "bg-primary text-primary-foreground text-xs"
    : "bg-muted text-muted-foreground text-xs";

  return (
    <Avatar
      className={className}
      role="img"
      aria-label={isUser ? "User" : "Assistant"}
    >
      <AvatarFallback className={fallbackClassName} aria-hidden="true">
        {isUser ? <>💸</> : <>🤖</>}
      </AvatarFallback>
    </Avatar>
  );
}
