import React from "react";
import { useLocation } from "react-router-dom";
import { ConversationItem } from "./ConversationItem";
import type {
  ConversationGroup as ConversationGroupType,
  Conversation,
} from "../../types";
import type { IConversation } from "../../lib/db";

interface ConversationGroupProps {
  group: ConversationGroupType;
  conversations: IConversation[] | null;
  editingId: number | null;
  openMenuId: number | null;
  onConversationClick: (id: number) => void;
  onFavouriteToggle: (id: number) => void;
  onRename: (id: number) => void;
  onDelete: (id: number) => void;
  onSaveRename: (id: number, newTitle: string) => void;
  onCancelRename: () => void;
  onMenuOpenChange: (id: number | null) => void;
}

export const ConversationGroup: React.FC<ConversationGroupProps> = ({
  group,
  conversations,
  editingId,
  openMenuId,
  onConversationClick,
  onFavouriteToggle,
  onRename,
  onDelete,
  onSaveRename,
  onCancelRename,
  onMenuOpenChange,
}) => {
  const pathname = useLocation().pathname;

  const conversationId = pathname.split("/chat/")[1]?.split("/")[0];

  const getOriginalConversation = (conversationUIId: number) => {
    return conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationUIId
    );
  };

  const isActive = (conversation: Conversation) => {
    const originalConversation = getOriginalConversation(conversation.id);
    return originalConversation?.id === conversationId;
  };

  return (
    <div>
      <h2 className="text-xs text-muted-foreground font-semibold mb-2 px-2">
        {group.label}
      </h2>
      {group.conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isEditing={editingId === conversation.id}
          isMenuOpen={openMenuId === conversation.id}
          isActive={isActive(conversation)}
          onConversationClick={() => onConversationClick(conversation.id)}
          onFavouriteToggle={(e) => {
            e.stopPropagation();
            onFavouriteToggle(conversation.id);
          }}
          onRename={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRename(conversation.id);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
          onSaveRename={(newTitle) => onSaveRename(conversation.id, newTitle)}
          onCancelRename={onCancelRename}
          onMenuOpenChange={(open) =>
            onMenuOpenChange(open ? conversation.id : null)
          }
        />
      ))}
      {group.label !== "Last 7 Days" && <div className="h-4" />}
    </div>
  );
};
