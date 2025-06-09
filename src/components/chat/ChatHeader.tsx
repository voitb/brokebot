import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Plus, Keyboard, Home, Sun, Moon, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebarContext } from "../layout/ResponsiveChatLayout";
import { useConversations } from "../../hooks/useConversations";
import { useTheme } from "../../providers/ThemeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { SettingsDialog } from "../dialogs/SettingsDialog";

// Mock function to get conversation title - later replace with IndexedDB
const getConversationTitle = (id: string) => {
  const titles: Record<string, string> = {
    "1": "How does blockchain work?",
    "2": "Hackathon Winning App Ideas",
    "3": "R3F Library with Components",
  };
  return titles[id] || `Conversation ${id}`;
};

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate BrokeBot faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">General</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>New Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+N
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+B
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+J
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Show Shortcuts</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    ?
                  </kbd>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Chat Actions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Pin Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+P
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rename Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+F2
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delete Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+Del
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Close Modal</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChatHeader() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { conversations, togglePinConversation } = useConversations();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { sidebarOpen } = useSidebarContext();
  const { theme, setTheme } = useTheme();

  // Get current conversation from database
  const currentConversation = conversations?.find(
    (c) => c.id === conversationId
  );
  const conversationTitle =
    currentConversation?.title ||
    (conversationId ? getConversationTitle(conversationId) : null);
  const isConversationPinned = currentConversation?.pinned || false;

  // Handle question mark key to toggle shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        // Only if not typing in input/textarea
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev); // Toggle instead of just opening
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewChat = () => {
    const newConversationId = Date.now();
    navigate(`/chat/${newConversationId}`);
  };

  return (
    <TooltipProvider>
      <header className="p-4 flex justify-between items-center gap-4 border-b border-border">
        {/* Left side - Breadcrumbs or New Chat button */}
        <div
          className={`flex items-center gap-4 flex-1 min-w-0 ${
            !sidebarOpen ? "ml-12 lg:ml-0" : ""
          }`}
        >
          {/* New Chat button when sidebar is closed */}
          {!sidebarOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new conversation (Alt+N)</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Breadcrumbs when conversation is selected */}
          {conversationTitle && (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate("/")}
                    className="cursor-pointer flex items-center gap-1 hover:text-foreground"
                  >
                    <Home className="w-3 h-3" />
                    BrokeBot
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-64">
                    {conversationTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* Shortcuts Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShortcutsOpen(!shortcutsOpen)}
              >
                <Keyboard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Keyboard shortcuts (?)</p>
            </TooltipContent>
          </Tooltip>

          {/* Star/Pin Button */}
          {conversationId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    conversationId && togglePinConversation(conversationId)
                  }
                >
                  <Star
                    className={`w-4 h-4 ${
                      isConversationPinned ? "fill-current text-yellow-500" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isConversationPinned ? "Unpin" : "Pin"} conversation (Alt+P)
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </TooltipProvider>
  );
}
