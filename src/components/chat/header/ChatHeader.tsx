import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { MoreHorizontal, Star, Sun, Moon, Settings, Keyboard, Share2, Download, Upload, Trash2 } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../../ui/sidebar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useTheme } from "../../../providers/ThemeProvider";
import { useConversationId } from "../../../hooks/useConversationId";
import {
  BreadcrumbNavigation,
  NewChatButton,
} from "./components";
import { useHeaderActions } from "./hooks/useHeaderActions"; 
import { DeleteConversationDialog } from "../sidebar/components/DeleteConversationDialog";

/**
 * Main chat header component with responsive layout
 * Mobile: sidebar trigger + centered title + action buttons
 * Desktop: breadcrumbs/new chat button + action buttons
 */
export const ChatHeader: React.FC = () => {
  const navigate = useNavigate();
  const conversationId = useConversationId();
  const { open: sidebarOpen } = useSidebar();
  const { theme, setTheme } = useTheme();

  const {
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
    handleExportConversation,
    handleImportConversation,
    handleFileImport, 
    fileInputRef,
    handleDeleteConversation,
    handleDeleteConfirm,
  } = useHeaderActions({ conversationId });

  // Action button handlers
  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleOpenSettings = () => {
    navigate({ search: createSearchParams({ modal: "settings" }).toString() });
  };

  const handleOpenShortcuts = () => {
    navigate({ search: createSearchParams({ modal: "shortcuts" }).toString() });
  };

  const handleOpenShare = () => {
    if (!conversationId) return;
    navigate({
      search: createSearchParams({
        modal: "share",
        conversationId,
      }).toString(),
    });
  };

  // Context menu items component
  const ContextMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleOpenSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOpenShortcuts}>
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcuts
        </DropdownMenuItem>
        
        {conversationId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportConversation}>
              <Download className="w-4 h-4 mr-2" />
              Export conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportConversation}>
              <Upload className="w-4 h-4 mr-2" />
              Import conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="focus:bg-destructive/10"
              onClick={handleDeleteConversation}
            >
              <Trash2 className="w-4 h-4 mr-2 text-destructive" />
              <span className="text-destructive">Delete conversation</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider>
      <header className="p-4 flex justify-between items-center gap-4">
        {/* Mobile layout - sidebar trigger, centered title, action buttons */}
        <div className="md:hidden flex items-center justify-between w-full">
          <SidebarTrigger /> 
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleToggleTheme}>
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

            {/* Pin conversation (only when conversation exists) */}
            {conversationId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleTogglePinConversation}>
                    <Star
                      className={`w-4 h-4 ${
                        isConversationPinned ? "fill-current text-yellow-500" : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isConversationPinned ? "Unpin" : "Pin"} conversation</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Context menu */}
            <ContextMenu />
          </div>
        </div>

        {/* Desktop layout - breadcrumbs and buttons */}
        <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
          {/* New Chat button when sidebar is closed */}
          {!sidebarOpen && <NewChatButton onNewChat={handleNewChat} />}

          {/* Breadcrumbs when conversation is selected */}
          <BreadcrumbNavigation
            conversationTitle={conversationTitle}
            isLoadingConversation={isLoadingConversation}
            isEditingTitle={isEditingTitle}
            onTitleClick={handleTitleClick}
            onSaveTitle={handleSaveTitle}
            onCancelTitleEdit={handleCancelTitleEdit}
          />
        </div>

        {/* Right side - Action buttons (desktop only) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleToggleTheme}>
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

          {/* Pin conversation (only when conversation exists) */}
          {conversationId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleTogglePinConversation}>
                  <Star
                    className={`w-4 h-4 ${
                      isConversationPinned ? "fill-current text-yellow-500" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isConversationPinned ? "Unpin" : "Pin"} conversation</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Context menu */}
          <ContextMenu />
        </div>
      </header>

      {/* File input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept="application/json"
      />
 

      {/* Delete confirmation dialog */}
      {conversationId && conversationTitle && (
        <DeleteConversationDialog
          open={deleteDialogOpen}
          conversationTitle={conversationTitle}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </TooltipProvider>
  );
};
