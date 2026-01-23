import { useState, useEffect, useEffectEvent } from "react";

interface UseTitleEditOptions {
  conversationId?: string;
  currentTitle?: string;
  onSaveTitle: (conversationId: string, newTitle: string) => Promise<void>;
}

interface UseTitleEditReturn {
  isEditingTitle: boolean;
  handleTitleClick: () => void;
  handleSaveTitle: (newTitle: string) => Promise<void>;
  handleCancelTitleEdit: () => void;
}

export function useTitleEdit({
  conversationId,
  currentTitle,
  onSaveTitle,
}: UseTitleEditOptions): UseTitleEditReturn {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const onRenameEvent = useEffectEvent(() => {
    if (conversationId && currentTitle !== undefined) {
      setIsEditingTitle(true);
    }
  });

  useEffect(() => {
    const handleRename = () => {
      onRenameEvent();
    };

    document.addEventListener("conversation:rename", handleRename);
    return () => {
      document.removeEventListener("conversation:rename", handleRename);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onRenameEvent is from useEffectEvent (stable)
  }, []);

  const handleTitleClick = () => {
    if (conversationId && currentTitle !== undefined) {
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (conversationId && newTitle.trim() !== currentTitle) {
      await onSaveTitle(conversationId, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
  };

  return {
    isEditingTitle,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
  };
}
