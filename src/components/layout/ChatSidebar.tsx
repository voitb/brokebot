import { Plus, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationList } from "../chat/ConversationList";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useState } from "react";

// Importy shadcn - tymczasowo komentowane do czasu instalacji
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { ScrollArea } from '../ui/scroll-area';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import { Badge } from '../ui/badge';
// import { Separator } from '../ui/separator';

export function ChatSidebar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewChat = () => {
    // Generate new conversation ID (later this will be from IndexedDB)
    const newConversationId = Date.now();
    navigate(`/chat/${newConversationId}`);
  };

  return (
    <aside className="w-full h-full bg-card flex flex-col border-r border-border">
      {/* Header - clean without badge collision */}
      <div className="p-4 pb-3">
        <h1 className="text-xl font-bold">BrokeBot</h1>
      </div>

      {/* New Chat Button */}
      <div className="px-4 pb-4">
        <Button className="w-full gap-2" size="sm" onClick={handleNewChat}>
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Search with functionality */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="pl-10 h-9"
            placeholder="Search conversations..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List with search filter */}
      <div className="flex-1 min-h-0 pl-4">
        <ScrollArea className="h-full">
          <div className="pr-4">
            <ConversationList searchQuery={searchQuery} />
          </div>
        </ScrollArea>
      </div>

      {/* User Profile - single status only */}
      <div className="p-4 pt-3 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">User</p>
              <Badge variant="secondary" className="text-xs shrink-0">
                💸 Free Plan
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
    </aside>
  );
}
