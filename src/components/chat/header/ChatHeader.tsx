import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "../../ui/sidebar";
import { TooltipProvider } from "../../ui/tooltip";
import { useTheme } from "../../../providers/ThemeProvider";
import { useConversationId } from "../../../hooks/useConversationId";
import {
  ActionButtons,
  BreadcrumbNavigation,
  NewChatButton,
} from "./components";
import { useHeaderActions } from "./hooks/useHeaderActions";
import { ImportConfirmationDialog } from "../modals/ImportConfirmationDialog";

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
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
    handleExportConversation,
    handleImportConversation,
    handleFileImport,
    importDialogOpen,
    setImportDialogOpen,
    handleOverwrite,
    handleAppend,
    fileInputRef,
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

  return (
    <TooltipProvider>
      <header className="p-4 flex justify-between items-center gap-4">
        {/* Mobile layout - sidebar trigger, centered title, action buttons */}
        <div className="md:hidden flex items-center justify-between w-full">
          <SidebarTrigger /> 
          <div className="flex items-center gap-2">
            <ActionButtons
              theme={theme}
              conversationId={conversationId}
              isConversationPinned={isConversationPinned}
              showShortcuts={false}
              onToggleTheme={handleToggleTheme}
              onTogglePinConversation={handleTogglePinConversation}
              onOpenSettings={handleOpenSettings}
              onOpenShortcuts={handleOpenShortcuts}
              onOpenShare={handleOpenShare}
              onExportConversation={handleExportConversation}
              onImportConversation={handleImportConversation}
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
          <ActionButtons
            theme={theme}
            conversationId={conversationId}
            isConversationPinned={isConversationPinned}
            showShortcuts={false}
            onToggleTheme={handleToggleTheme}
            onTogglePinConversation={handleTogglePinConversation}
            onOpenSettings={handleOpenSettings}
            onOpenShortcuts={handleOpenShortcuts}
            onOpenShare={handleOpenShare}
            onExportConversation={handleExportConversation}
            onImportConversation={handleImportConversation}
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

      {/* Modals */}
      <ImportConfirmationDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onAppend={handleAppend}
        onOverwrite={handleOverwrite}
      />
    </TooltipProvider>
  );
};
