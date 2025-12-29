import { Badge } from "@/components/ui/badge";
import { formatMessageTime } from "@/features/chat/utils/format-message-time";

interface MessageTimestampProps {
  timestamp: Date;
  isUser: boolean;
}

/**
 * Message timestamp component with hover effect
 */
export function MessageTimestamp({ timestamp, isUser }: MessageTimestampProps) {
  return (
    <div
      className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
        isUser ? "text-right" : "text-left"
      }`}
    >
      <Badge variant="outline" className="text-xs">
        {formatMessageTime(timestamp)}
      </Badge>
    </div>
  );
} 