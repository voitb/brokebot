import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationDelete } from "./use-conversation-delete";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";

describe("useConversationDelete", () => {
  const mockDeleteConversation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteConversation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns deleteDialogOpen as false initially", () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      expect(result.current.deleteDialogOpen).toBe(false);
    });
  });

  describe("handleDeleteConversation", () => {
    it("opens delete dialog", () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      act(() => {
        result.current.handleDeleteConversation();
      });

      expect(result.current.deleteDialogOpen).toBe(true);
    });
  });

  describe("setDeleteDialogOpen", () => {
    it("controls dialog state", () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      act(() => {
        result.current.setDeleteDialogOpen(true);
      });

      expect(result.current.deleteDialogOpen).toBe(true);

      act(() => {
        result.current.setDeleteDialogOpen(false);
      });

      expect(result.current.deleteDialogOpen).toBe(false);
    });
  });

  describe("handleDeleteConfirm", () => {
    it("deletes conversation, shows success toast, and navigates", async () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockDeleteConversation).toHaveBeenCalledWith("conv-1");
      expect(mockToast.success).toHaveBeenCalledWith(
        "Conversation deleted successfully."
      );
      expect(result.current.deleteDialogOpen).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/chat");
    });

    it("shows error toast on deletion failure", async () => {
      mockDeleteConversation.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to delete conversation."
      );
    });

    it("does nothing without conversationId", async () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: undefined,
          deleteConversation: mockDeleteConversation,
        })
      );

      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(mockDeleteConversation).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("delete event listener", () => {
    it("opens dialog when conversation:delete event matches conversationId", () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      act(() => {
        document.dispatchEvent(
          new CustomEvent("conversation:delete", {
            detail: { conversationId: "conv-1" },
          })
        );
      });

      expect(result.current.deleteDialogOpen).toBe(true);
    });

    it("does not open dialog when event conversationId does not match", () => {
      const { result } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      act(() => {
        document.dispatchEvent(
          new CustomEvent("conversation:delete", {
            detail: { conversationId: "conv-2" },
          })
        );
      });

      expect(result.current.deleteDialogOpen).toBe(false);
    });

    it("cleans up event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() =>
        useConversationDelete({
          conversationId: "conv-1",
          deleteConversation: mockDeleteConversation,
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "conversation:delete",
        expect.any(Function)
      );
    });
  });
});
