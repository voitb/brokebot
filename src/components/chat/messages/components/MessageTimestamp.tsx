import React from "react";
import { Badge } from "../../../ui/badge";
import { formatMessageTime } from "../utils";

interface MessageTimestampProps {
  timestamp: Date;
  isUser: boolean;
}

/**
 * Message timestamp component with hover effect
 */
export const MessageTimestamp: React.FC<MessageTimestampProps> = React.memo(({
  timestamp,
  isUser,
}) => (
  <div
    className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
      isUser ? "text-right" : "text-left"
    }`}
  >
    <Badge variant="outline" className="text-xs">
      {formatMessageTime(timestamp)}
    </Badge>
  </div>
)); 