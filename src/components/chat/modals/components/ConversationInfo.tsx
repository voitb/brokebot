import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Globe, Lock } from "lucide-react";
import type { Conversation } from "../../../../lib/db";

interface ConversationInfoProps {
  conversation: Conversation;
  messagesCount: number;
  hasCloudStorage: boolean;
  isShared: boolean;
}

/**
 * Conversation information display component
 */
export const ConversationInfo: React.FC<ConversationInfoProps> = React.memo(({
  conversation,
  messagesCount,
  hasCloudStorage,
  isShared,
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm">Conversation Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Messages:</span>
        <Badge variant="outline">{messagesCount} messages</Badge>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Created:</span>
        <span>{conversation.createdAt.toLocaleDateString()}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Storage:</span>
        <div className="flex items-center gap-1">
          {hasCloudStorage ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Cloud + Local
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Local Only
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Status:</span>
        <div className="flex items-center gap-1">
          {isShared ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Shared
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)); 