import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Star, Edit, Trash2 } from "lucide-react";
import type { ConversationGroup } from "../../types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

// Mock data - later replace with IndexedDB data
const mockConversationGroups: ConversationGroup[] = [
  {
    label: "Pinned",
    conversations: [
      {
        id: 1,
        title: "How does blockchain work?",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: true,
      },
      {
        id: 2,
        title: "Hackathon Winning App Ideas",
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: true,
      },
    ],
  },
  {
    label: "Today",
    conversations: [
      {
        id: 3,
        title: "R3F Library with Components",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        title: "Fabric Canvas Component Integration",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        title: "Image Loading Problem",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        title: "JavaScript/React Libraries for Data",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        title: "Meme Creation App",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    label: "Yesterday",
    conversations: [
      {
        id: 8,
        title: "NestJS 15 Folders in Parentheses",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 9,
        title: "Folder Structure for Meme App",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 10,
        title: "Reddit API, Algorand, Revenue",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 11,
        title: "Web3 SaaS Application Ideas",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    label: "Last 7 Days",
    conversations: [
      {
        id: 12,
        title: "Applications and Monetization",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

interface ConversationListProps {
  searchQuery?: string;
}

export function ConversationList({ searchQuery = "" }: ConversationListProps) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Filter conversations based on search query
  const filteredGroups = mockConversationGroups
    .map((group) => ({
      ...group,
      conversations: group.conversations.filter((conversation) =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.conversations.length > 0);

  const handleConversationClick = (conversationId: number) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleFavouriteConversation = (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    console.log("Favourite conversation:", conversationId);
    // TODO: Implement favourite functionality with IndexedDB
  };

  const handleRenameConversation = (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    console.log("Rename conversation:", conversationId);
    // TODO: Implement rename functionality with IndexedDB
  };

  const handleDeleteConversation = (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    console.log("Delete conversation:", conversationId);
    // TODO: Implement delete functionality with IndexedDB
  };

  if (filteredGroups.length === 0 && searchQuery) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No conversations found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <h2 className="text-xs text-muted-foreground font-semibold mb-2 px-2">
            {group.label}
          </h2>
          {group.conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative px-2 py-1.5 text-sm text-foreground rounded-md transition-all duration-200 cursor-pointer ${
                openMenuId === conversation.id ? "bg-muted" : "hover:bg-muted"
              }`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-center justify-between min-w-0">
                <span className="truncate flex-1 pr-10">
                  {conversation.title}
                </span>

                {/* Proper shadcn dropdown menu on hover with better positioning */}
                <DropdownMenu
                  onOpenChange={(open) => {
                    setOpenMenuId(open ? conversation.id : null);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity bg-muted/90 hover:bg-muted/100 backdrop-blur-sm shrink-0 z-10 ${
                        openMenuId === conversation.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavouriteConversation(conversation.id, e);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 mr-2 ${
                          conversation.isPinned
                            ? "fill-current text-yellow-500"
                            : ""
                        }`}
                      />
                      {conversation.isPinned ? "Remove from" : "Add to"}{" "}
                      Favourites
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameConversation(conversation.id, e);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id, e);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {group.label !== "Last 7 Days" && <div className="h-4" />}
        </div>
      ))}
    </div>
  );
}
