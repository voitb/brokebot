import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../ui/breadcrumb";
import { EditableConversationTitle } from "../../EditableConversationTitle";

interface BreadcrumbNavigationProps {
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isEditingTitle: boolean;
  onTitleClick: () => void;
  onSaveTitle: (newTitle: string) => void;
  onCancelTitleEdit: () => void;
}

/**
 * Breadcrumb navigation component for chat header
 * Shows app name -> conversation title with loading and editing states
 */
export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  conversationTitle,
  isLoadingConversation,
  isEditingTitle,
  onTitleClick,
  onSaveTitle,
  onCancelTitleEdit,
}) => {
  const navigate = useNavigate();

  if (!conversationTitle && !isLoadingConversation) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-1 hover:text-foreground"
          >
            <Home className="w-3 h-3" />
            Local-GPT
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className={`${isEditingTitle ? "rounded-none!" : ""}`}>
          {isLoadingConversation ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : isEditingTitle ? (
            <EditableConversationTitle
              initialTitle={conversationTitle!}
              onSave={onSaveTitle}
              onCancel={onCancelTitleEdit}
              className="max-w-64"
            />
          ) : (
            <BreadcrumbPage
              className="truncate max-w-64 cursor-pointer hover:text-foreground transition-colors"
              onClick={onTitleClick}
            >
              {conversationTitle}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
