import { useNavigate, createSearchParams } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/app/providers/theme-provider";
import { useConversationId } from "@/hooks";
import { BreadcrumbNavigation } from "../breadcrumb-navigation";
import { HeaderActions } from "../header-actions";
import { NewChatButton } from "../new-chat-button";
import { useHeaderActions } from "./use-header-actions";
import { DeleteConversationDialog } from "../../sidebar/delete-conversation-dialog";

export function ChatHeader() {
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

  const actionProps = {
    conversationId,
    isPinned: isConversationPinned,
    theme,
    onToggleTheme: handleToggleTheme,
    onTogglePin: handleTogglePinConversation,
    onOpenSettings: handleOpenSettings,
    onOpenShortcuts: handleOpenShortcuts,
    onOpenExport: handleOpenExport,
    onImportConversation: handleImportConversation,
    onDeleteConversation: handleDeleteConversation,
  };

  return (
    <>
      <header className="p-4 flex justify-between items-center gap-4">
        <div className="md:hidden flex items-center justify-between w-full">
          <SidebarTrigger />
          <HeaderActions {...actionProps} />
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
          {!sidebarOpen && <NewChatButton onNewChat={handleNewChat} />}
          <BreadcrumbNavigation
            conversationTitle={conversationTitle}
            isLoadingConversation={isLoadingConversation}
            isEditingTitle={isEditingTitle}
            onTitleClick={handleTitleClick}
            onSaveTitle={handleSaveTitle}
            onCancelTitleEdit={handleCancelTitleEdit}
          />
        </div>

        <HeaderActions {...actionProps} className="hidden md:flex shrink-0" />
      </header>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept="application/json"
      />

      {conversationId && conversationTitle && (
        <DeleteConversationDialog
          open={deleteDialogOpen}
          conversationTitle={conversationTitle}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}
