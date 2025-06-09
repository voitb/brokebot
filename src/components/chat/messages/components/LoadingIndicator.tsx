import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

/**
 * Loading indicator for AI response
 */
export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <Avatar className="w-8 h-8 mr-3 mt-1">
        <AvatarImage src="" />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          🤖
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted p-3 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-400"></div>
        </div>
      </div>
    </div>
  );
};
