import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { Star, Sun, Moon } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";
import { useConversationId } from "@/hooks/use-conversation-id";
import { BreadcrumbNavigation } from "./components/breadcrumb-navigation";
import { HeaderActionsMenu } from "./components/header-actions-menu";
import { NewChatButton } from "./components/new-chat-button";
import { useHeaderActions } from "@/components/chat/hooks/use-header-actions";
import { DeleteConversationDialog } from "../sidebar/components/delete-conversation-dialog";

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

  const handleOpenExport = () => {
    if (!conversationId) return;
    navigate({
      search: createSearchParams({
        modal: "export",
        conversationId,
      }).toString(),
    });
  };

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
            <HeaderActionsMenu
              conversationId={conversationId}
              onOpenSettings={handleOpenSettings}
              onOpenShortcuts={handleOpenShortcuts}
              onOpenExport={handleOpenExport}
              onImportConversation={handleImportConversation}
              onDeleteConversation={handleDeleteConversation}
            />
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
          <HeaderActionsMenu
            conversationId={conversationId}
            onOpenSettings={handleOpenSettings}
            onOpenShortcuts={handleOpenShortcuts}
            onOpenExport={handleOpenExport}
            onImportConversation={handleImportConversation}
            onDeleteConversation={handleDeleteConversation}
          />
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
