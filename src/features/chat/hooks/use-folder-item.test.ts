import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFolderItem } from "./use-folder-item";
import type { Folder } from "@/lib/db";

// Mock external dependencies
const mockDeleteFolder = vi.fn();
const mockUpdateFolderName = vi.fn();
const mockHandleNewChat = vi.fn();

vi.mock("@/app/providers/conversations-provider", () => ({
  useConversations: vi.fn(() => ({
    deleteFolder: mockDeleteFolder,
    updateFolderName: mockUpdateFolderName,
  })),
}));

vi.mock("@/features/chat/hooks/use-conversation-list", () => ({
  useConversationList: vi.fn(() => ({
    handleNewChat: mockHandleNewChat,
  })),
}));

const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  id: "folder-1",
  name: "Test Folder",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

describe("useFolderItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("initializes with folder open by default", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      expect(result.current.isOpen).toBe(true);
    });

    it("initializes with menu closed", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      expect(result.current.isMenuOpen).toBe(false);
    });

    it("initializes with dialogs closed", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      expect(result.current.isRenameDialogOpen).toBe(false);
      expect(result.current.isDeleteDialogOpen).toBe(false);
    });
  });

  describe("collapse/expand", () => {
    it("toggles folder open state", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("delete flow", () => {
    it("opens delete dialog on handleDelete", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleDelete(mockEvent);
      });

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(result.current.isDeleteDialogOpen).toBe(true);
      expect(result.current.isMenuOpen).toBe(false);
    });

    it("calls deleteFolder on handleDeleteConfirm", () => {
      const folder = createMockFolder({ id: "folder-123" });
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mockDeleteFolder).toHaveBeenCalledWith("folder-123");
      expect(result.current.isDeleteDialogOpen).toBe(false);
    });

    it("closes delete dialog on closeDeleteDialog", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      // First open the dialog
      act(() => {
        const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
        result.current.handleDelete(mockEvent);
      });

      expect(result.current.isDeleteDialogOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.closeDeleteDialog();
      });

      expect(result.current.isDeleteDialogOpen).toBe(false);
    });
  });

  describe("rename flow", () => {
    it("opens rename dialog on openRenameDialog", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.openRenameDialog();
      });

      expect(result.current.isRenameDialogOpen).toBe(true);
      expect(result.current.isMenuOpen).toBe(false);
    });

    it("calls updateFolderName on handleRename with valid name", () => {
      const folder = createMockFolder({ id: "folder-456" });
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.handleRename("New Folder Name");
      });

      expect(mockUpdateFolderName).toHaveBeenCalledWith("folder-456", "New Folder Name");
      expect(result.current.isRenameDialogOpen).toBe(false);
    });

    it("trims whitespace from folder name", () => {
      const folder = createMockFolder({ id: "folder-789" });
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.handleRename("  Trimmed Name  ");
      });

      expect(mockUpdateFolderName).toHaveBeenCalledWith("folder-789", "Trimmed Name");
    });

    it("does not call updateFolderName with empty name", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.handleRename("");
      });

      expect(mockUpdateFolderName).not.toHaveBeenCalled();
    });

    it("does not call updateFolderName with whitespace-only name", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.handleRename("   ");
      });

      expect(mockUpdateFolderName).not.toHaveBeenCalled();
    });

    it("closes rename dialog on closeRenameDialog", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      // First open the dialog
      act(() => {
        result.current.openRenameDialog();
      });

      expect(result.current.isRenameDialogOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.closeRenameDialog();
      });

      expect(result.current.isRenameDialogOpen).toBe(false);
    });
  });

  describe("new chat in folder", () => {
    it("calls handleNewChat with folder id", () => {
      const folder = createMockFolder({ id: "folder-new-chat" });
      const { result } = renderHook(() => useFolderItem(folder));

      const mockEvent = {
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleNewChatInFolder(mockEvent);
      });

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockHandleNewChat).toHaveBeenCalledWith("folder-new-chat");
    });
  });

  describe("menu state", () => {
    it("allows setting menu open state", () => {
      const folder = createMockFolder();
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.setIsMenuOpen(true);
      });

      expect(result.current.isMenuOpen).toBe(true);

      act(() => {
        result.current.setIsMenuOpen(false);
      });

      expect(result.current.isMenuOpen).toBe(false);
    });
  });
});
