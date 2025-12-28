import React from "react";
import { Loader2 } from "lucide-react";
import { MessageAvatar } from "./MessageAvatar";

/**
 * Indicator shown when AI is generating but has no content yet
 */
export const GeneratingIndicator: React.FC = React.memo(() => (
  <div className="flex justify-start group">
    <MessageAvatar isUser={false} isGenerating={true} position="left" />
    <div className="flex items-center gap-2 text-muted-foreground py-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Responding...</span>
    </div>
  </div>
)); 