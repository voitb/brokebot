import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFolderItem } from "./use-folder-item";
import type { Folder } from "@/lib/db";

const mockDeleteFolder = vi.fn();
const mockUpdateFolderName = vi.fn();
const mockHandleNewChat = vi.fn();

vi.mock("@/app/providers/conversations-provider", () => ({
  useConversations: vi.fn(() => ({
    deleteFolder: mockDeleteFolder,
    updateFolderName: mockUpdateFolderName,
  })),
}));

vi.mock("@/hooks/use-conversation-list", () => ({
  useConversationList: vi.fn(() => ({
    handleNewChat: mockHandleNewChat,
  })),
}));

const baseFolder: Folder = {
  id: "folder-1",
  name: "Test Folder",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("useFolderItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with folder open and dialogs closed", () => {
    const { result } = renderHook(() => useFolderItem(baseFolder));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isMenuOpen).toBe(false);
    expect(result.current.isRenameDialogOpen).toBe(false);
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  describe("delete flow", () => {
    it("opens delete dialog, confirms deletion, and closes", () => {
      const folder = { ...baseFolder, id: "folder-123" };
      const { result } = renderHook(() => useFolderItem(folder));

      const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
      act(() => {
        result.current.handleDelete(mockEvent);
      });

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(result.current.isDeleteDialogOpen).toBe(true);
      expect(result.current.isMenuOpen).toBe(false);

      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mockDeleteFolder).toHaveBeenCalledWith("folder-123");
      expect(result.current.isDeleteDialogOpen).toBe(false);
    });

    it("closes delete dialog without deleting", () => {
      const { result } = renderHook(() => useFolderItem(baseFolder));

      act(() => {
        result.current.handleDelete({ stopPropagation: vi.fn() } as unknown as React.MouseEvent);
      });
      act(() => {
        result.current.closeDeleteDialog();
      });

      expect(result.current.isDeleteDialogOpen).toBe(false);
      expect(mockDeleteFolder).not.toHaveBeenCalled();
    });
  });

  describe("rename flow", () => {
    it("opens rename dialog and saves trimmed name", () => {
      const folder = { ...baseFolder, id: "folder-456" };
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.openRenameDialog();
      });
      expect(result.current.isRenameDialogOpen).toBe(true);
      expect(result.current.isMenuOpen).toBe(false);

      act(() => {
        result.current.handleRename("  New Folder Name  ");
      });

      expect(mockUpdateFolderName).toHaveBeenCalledWith("folder-456", "New Folder Name");
      expect(result.current.isRenameDialogOpen).toBe(false);
    });

    it("does not save empty or whitespace-only names", () => {
      const { result } = renderHook(() => useFolderItem(baseFolder));

      act(() => {
        result.current.handleRename("");
      });
      act(() => {
        result.current.handleRename("   ");
      });

      expect(mockUpdateFolderName).not.toHaveBeenCalled();
    });
  });

  describe("new chat in folder", () => {
    it("calls handleNewChat with folder id", () => {
      const folder = { ...baseFolder, id: "folder-new-chat" };
      const { result } = renderHook(() => useFolderItem(folder));

      const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
      act(() => {
        result.current.handleNewChatInFolder(mockEvent);
      });

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockHandleNewChat).toHaveBeenCalledWith("folder-new-chat");
    });
  });
});
