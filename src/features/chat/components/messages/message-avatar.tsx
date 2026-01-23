import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageAvatarProps {
  isUser: boolean;
  isGenerating?: boolean;
  position: "left" | "right";
}

function AvatarContent({ isUser }: { isUser: boolean }) {
  return isUser ? <>💸</> : <>🤖</>;
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
    <Avatar className={className}>
      <AvatarImage src="" />
      <AvatarFallback className={fallbackClassName}>
        <AvatarContent isUser={isUser} />
      </AvatarFallback>
    </Avatar>
  );
}
