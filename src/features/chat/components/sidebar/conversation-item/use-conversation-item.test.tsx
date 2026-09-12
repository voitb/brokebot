import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { useConversationItem } from "./use-conversation-item";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { clearTestDatabase, seedConversation } from "@/testing/db-helpers";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";
import { db, type Conversation } from "@/lib/db";

function RenameHarness({ conversation }: { conversation: Conversation }) {
  const { handleRename, handleConversationClick, isEditing } = useConversationItem(conversation);

  return (
    <div>
      <button type="button" onClick={handleRename}>
        Rename
      </button>
      <button type="button" onClick={handleConversationClick}>
        Open
      </button>
      {isEditing ? <span>editing</span> : null}
    </div>
  );
}

const SEEDED_AT = new Date("2024-01-01T00:00:00.000Z");

describe("useConversationItem", () => {
  let testConversation: Conversation;

  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    testConversation = await seedConversation({ title: "Test Chat", updatedAt: SEEDED_AT });
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

  it("does not navigate when editing", async () => {
    const user = userEvent.setup();
    render(<RenameHarness conversation={testConversation} />, { wrapper });

    await user.click(screen.getByRole("button", { name: "Rename" }));

    expect(screen.getByText("editing")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("saves renamed title and exits editing mode", async () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.startEditing());

    await act(async () => {
      await result.current.handleSaveRename("New Title");
    });

    await waitFor(async () => {
      const storedConversation = await db.conversations.get(testConversation.id);
      expect(storedConversation?.title).toBe("New Title");
    });

    expect(result.current.isEditing).toBe(false);
  });

  it("skips save when title unchanged", async () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    act(() => result.current.startEditing());

    await act(async () => {
      await result.current.handleSaveRename(testConversation.title);
    });

    const storedConversation = await db.conversations.get(testConversation.id);
    expect(storedConversation?.updatedAt).toEqual(SEEDED_AT);
    expect(storedConversation?.title).toBe(testConversation.title);
    expect(result.current.isEditing).toBe(false);
  });

  it("deletes the conversation and confirms with a single toast", async () => {
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    await waitFor(async () => {
      expect(await db.conversations.get(testConversation.id)).toBeUndefined();
    });

    expect(mockToast.success).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalledWith("Conversation deleted successfully.");
  });

  it("does not confirm success when the delete fails", async () => {
    vi.spyOn(db.conversations, "delete").mockRejectedValueOnce(new Error("db down"));
    const { result } = renderHook(() => useConversationItem(testConversation), { wrapper });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    await waitFor(async () => {
      expect(await db.conversations.get(testConversation.id)).toBeDefined();
    });

    expect(mockToast.success).not.toHaveBeenCalled();
  });
});
