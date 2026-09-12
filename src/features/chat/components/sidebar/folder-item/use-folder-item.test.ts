import { createElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function FolderHarness({ folder }: { folder: Folder }) {
  const api = useFolderItem(folder);

  return createElement(
    "div",
    null,
    createElement("button", { type: "button", onClick: api.handleDelete }, "Delete folder"),
    createElement("button", { type: "button", onClick: api.handleNewChatInFolder }, "New chat in folder"),
    api.isDeleteDialogOpen
      ? createElement(
          "div",
          null,
          createElement("button", { type: "button", onClick: api.handleDeleteConfirm }, "Confirm delete"),
          createElement("button", { type: "button", onClick: api.closeDeleteDialog }, "Cancel delete"),
        )
      : null,
    createElement("span", null, api.isRenameDialogOpen ? "rename-open" : "rename-closed"),
    createElement("span", null, api.isDeleteDialogOpen ? "delete-open" : "delete-closed"),
  );
}

describe("useFolderItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with folder open and dialogs closed", () => {
    const { result } = renderHook(() => useFolderItem(baseFolder));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isRenameDialogOpen).toBe(false);
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  describe("delete flow", () => {
    it("opens delete dialog, confirms deletion, and closes", async () => {
      const user = userEvent.setup();
      const folder = { ...baseFolder, id: "folder-123" };
      render(createElement(FolderHarness, { folder }));

      await user.click(screen.getByRole("button", { name: "Delete folder" }));

      expect(screen.getByText("delete-open")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Confirm delete" }));

      expect(mockDeleteFolder).toHaveBeenCalledWith("folder-123");
      expect(screen.getByText("delete-closed")).toBeInTheDocument();
    });

    it("keeps the delete dialog open when deletion fails", async () => {
      mockDeleteFolder.mockRejectedValueOnce(new Error("db down"));
      const user = userEvent.setup();
      render(createElement(FolderHarness, { folder: baseFolder }));

      await user.click(screen.getByRole("button", { name: "Delete folder" }));
      await user.click(screen.getByRole("button", { name: "Confirm delete" }));

      expect(screen.getByText("delete-open")).toBeInTheDocument();
    });

    it("closes delete dialog without deleting", async () => {
      const user = userEvent.setup();
      render(createElement(FolderHarness, { folder: baseFolder }));

      await user.click(screen.getByRole("button", { name: "Delete folder" }));

      expect(screen.getByText("delete-open")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel delete" }));

      expect(screen.getByText("delete-closed")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Confirm delete" })).not.toBeInTheDocument();
      expect(mockDeleteFolder).not.toHaveBeenCalled();
    });
  });

  describe("rename flow", () => {
    it("opens rename dialog and saves trimmed name", async () => {
      const folder = { ...baseFolder, id: "folder-456" };
      const { result } = renderHook(() => useFolderItem(folder));

      act(() => {
        result.current.openRenameDialog();
      });
      expect(result.current.isRenameDialogOpen).toBe(true);

      await act(async () => {
        await result.current.handleRename("  New Folder Name  ");
      });

      expect(mockUpdateFolderName).toHaveBeenCalledWith("folder-456", "New Folder Name");
      expect(result.current.isRenameDialogOpen).toBe(false);
    });

    it("keeps the rename dialog open when saving fails", async () => {
      mockUpdateFolderName.mockRejectedValueOnce(new Error("db down"));
      const { result } = renderHook(() => useFolderItem(baseFolder));

      act(() => {
        result.current.openRenameDialog();
      });

      await act(async () => {
        await result.current.handleRename("New Folder Name");
      });

      expect(result.current.isRenameDialogOpen).toBe(true);
    });

    it("does not save empty or whitespace-only names", async () => {
      const { result } = renderHook(() => useFolderItem(baseFolder));

      await act(async () => {
        await result.current.handleRename("");
      });
      await act(async () => {
        await result.current.handleRename("   ");
      });

      expect(mockUpdateFolderName).not.toHaveBeenCalled();
    });
  });

  describe("new chat in folder", () => {
    it("calls handleNewChat with folder id", async () => {
      const user = userEvent.setup();
      const folder = { ...baseFolder, id: "folder-new-chat" };
      render(createElement(FolderHarness, { folder }));

      await user.click(screen.getByRole("button", { name: "New chat in folder" }));

      expect(mockHandleNewChat).toHaveBeenCalledWith("folder-new-chat");
    });
  });
});
