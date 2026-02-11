import { Badge } from "@/components/ui/badge";

interface MessageTimestampProps {
  timestamp: Date;
  isUser: boolean;
}

export function MessageTimestamp({ timestamp, isUser }: MessageTimestampProps) {
  return (
    <div
      className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
        isUser ? "text-right" : "text-left"
      }`}
    >
      <Badge variant="outline" className="text-xs">
        {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Badge>
    </div>
  );
}
