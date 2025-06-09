import React from "react";
import { SidebarTrigger } from "../../ui/sidebar";
import { TooltipProvider } from "../../ui/tooltip";
import { useSidebarContext } from "../../layout/ResponsiveChatLayout";
import { useTheme } from "../../../providers/ThemeProvider";
import { useConversationId } from "../../../hooks/useConversationId";
import {
  ActionButtons,
  BreadcrumbNavigation,
  NewChatButton,
} from "./components";
import { useHeaderActions } from "./hooks/useHeaderActions";
import { KeyboardShortcutsModal } from "../modals/KeyboardShortcutsModal";
import { SettingsDialog } from "../../dialogs/settings";

/**
 * Main chat header component with responsive layout
 * Mobile: sidebar trigger + centered title + action buttons
 * Desktop: breadcrumbs/new chat button + action buttons
 */
export const ChatHeader: React.FC = () => {
  const conversationId = useConversationId();
  const { sidebarOpen } = useSidebarContext();
  const { theme, setTheme } = useTheme();

  const {
    shortcutsOpen,
    settingsOpen,
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    setShortcutsOpen,
    setSettingsOpen,
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
  } = useHeaderActions({ conversationId });

  // Action button handlers
  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleOpenShortcuts = () => {
    setShortcutsOpen(!shortcutsOpen);
  };

  return (
    <TooltipProvider>
      <header className="p-4 flex justify-between items-center gap-4">
        {/* Mobile layout - sidebar trigger, centered title, action buttons */}
        <div className="md:hidden flex items-center w-full">
          <SidebarTrigger />
          <div className="flex-1 text-center">
            <span className="text-lg">Local-GPT</span>
          </div>
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
            showShortcuts={true}
            onToggleTheme={handleToggleTheme}
            onTogglePinConversation={handleTogglePinConversation}
            onOpenSettings={handleOpenSettings}
            onOpenShortcuts={handleOpenShortcuts}
          />
        </div>
      </header>

      {/* Modals */}
      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </TooltipProvider>
  );
};
