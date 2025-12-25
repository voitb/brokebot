import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConversationDelete } from "./useConversationDelete";

describe("useConversationDelete", () => {
  const mockDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with closed state", () => {
    const { result } = renderHook(() => useConversationDelete(mockDelete));
    expect(result.current.deleteConfirmation.open).toBe(false);
    expect(result.current.deleteConfirmation.conversationId).toBeNull();
    expect(result.current.deleteConfirmation.conversationTitle).toBe("");
  });

  it("opens confirmation dialog with conversation data", () => {
    const { result } = renderHook(() => useConversationDelete(mockDelete));

    act(() => {
      result.current.openDeleteConfirmation("conv-123", "My Chat");
    });

    expect(result.current.deleteConfirmation.open).toBe(true);
    expect(result.current.deleteConfirmation.conversationId).toBe("conv-123");
    expect(result.current.deleteConfirmation.conversationTitle).toBe("My Chat");
  });

  it("closes confirmation dialog", () => {
    const { result } = renderHook(() => useConversationDelete(mockDelete));

    act(() => {
      result.current.openDeleteConfirmation("conv-123", "My Chat");
    });
    act(() => {
      result.current.closeDeleteConfirmation();
    });

    expect(result.current.deleteConfirmation.open).toBe(false);
    expect(result.current.deleteConfirmation.conversationId).toBeNull();
    expect(result.current.deleteConfirmation.conversationTitle).toBe("");
  });

  it("calls delete and closes dialog on handleDeleteConversation", async () => {
    const { result } = renderHook(() => useConversationDelete(mockDelete));

    act(() => {
      result.current.openDeleteConfirmation("conv-123", "My Chat");
    });

    await act(async () => {
      await result.current.handleDeleteConversation("conv-123");
    });

    expect(mockDelete).toHaveBeenCalledWith("conv-123");
    expect(result.current.deleteConfirmation.open).toBe(false);
    expect(result.current.deleteConfirmation.conversationId).toBeNull();
  });
});
