import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationItem } from "./use-conversation-item";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { clearTestDatabase, seedConversation } from "@/testing/db-helpers";
import { mockNavigate } from "@/testing/mocks/modules";
import type { Conversation } from "@/lib/db";

function createMouseEvent(): React.MouseEvent {
  return { stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown as React.MouseEvent;
}

describe("useConversationItem", () => {
  let testConversation: Conversation;

  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    testConversation = await seedConversation({ title: "Test Chat" });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConversationsProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ConversationsProvider>
  );

  it("navigates to conversation on click", () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.handleConversationClick());

    expect(mockNavigate).toHaveBeenCalledWith(`/chat/${testConversation.id}`);
  });

  it("does not navigate when editing", () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.handleRename(createMouseEvent()));
    act(() => result.current.handleConversationClick());

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("saves renamed title and exits editing mode", async () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.startEditing());

    await act(async () => {
      await result.current.handleSaveRename("New Title");
    });

    expect(result.current.isEditing).toBe(false);
  });

  it("skips save when title unchanged", async () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.startEditing());

    await act(async () => {
      await result.current.handleSaveRename(testConversation.title);
    });

    expect(result.current.isEditing).toBe(false);
  });

  it("reflects conversation pinned state", () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    expect(result.current.isPinned).toBe(testConversation.pinned);
  });
});
