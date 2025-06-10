import React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useUserConfig } from "../../../../hooks/useUserConfig";

/**
 * User profile section for sidebar showing avatar, name, and status
 */
export const UserProfile: React.FC = () => {
  const { config } = useUserConfig();

  const displayName = config.nickname || config.fullName || "User";
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 border-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials || <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <Badge variant="secondary" className="text-xs shrink-0">
              💸 Local-GPT
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Local AI Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
