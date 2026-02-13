import { Loader2 } from "lucide-react";
import { MessageAvatar } from "./message-avatar";

export function GeneratingIndicator() {
  return (
    <div className="flex justify-start group">
      <MessageAvatar isUser={false} position="left" />
      <div className="flex items-center gap-2 text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Responding...</span>
      </div>
    </div>
  );
} 