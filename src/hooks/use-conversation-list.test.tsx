import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationList } from "./use-conversation-list";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import {
  clearTestDatabase,
  seedConversation,
  seedFolder,
} from "@/testing/db-helpers";
import { mockNavigate } from "@/testing/mocks/modules";
import { createMockMessage } from "@/testing/mocks/factories";
import { db } from "@/lib/db";

describe("useConversationList", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConversationsProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ConversationsProvider>
  );

  it("separates pinned conversations from regular ones", async () => {
    await seedConversation({ title: "Pinned", pinned: true });
    await seedConversation({ title: "Regular", pinned: false });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.pinnedConversations).toHaveLength(1);
      expect(result.current.unfoldedConversations).toHaveLength(1);
    });

    expect(result.current.pinnedConversations[0].title).toBe("Pinned");
  });

  it("groups conversations by folder", async () => {
    const folder = await seedFolder({ name: "Work" });
    await seedConversation({ title: "In Folder", folderId: folder.id });
    await seedConversation({ title: "No Folder" });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.foldersWithConversations).toHaveLength(1);
      expect(result.current.unfoldedConversations).toHaveLength(1);
    });

    expect(result.current.foldersWithConversations[0].name).toBe("Work");
    expect(
      result.current.foldersWithConversations[0].conversations
    ).toHaveLength(1);
  });

  it("filters conversations by search term and sorts by date", async () => {
    await seedConversation({
      title: "React Help",
      updatedAt: new Date("2024-01-01"),
    });
    await seedConversation({
      title: "React Tips",
      updatedAt: new Date("2024-12-01"),
    });
    await seedConversation({ title: "Vue Guide" });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(3);
    });

    act(() => {
      result.current.setSearchTerm("react");
    });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(2);
    });

    expect(result.current.unfoldedConversations[0].title).toBe("React Tips");
    expect(result.current.unfoldedConversations[1].title).toBe("React Help");
  });

  it("creates a conversation and navigates to it on handleNewChat", async () => {
    const { result } = renderHook(() => useConversationList(), { wrapper });

    await act(async () => {
      await result.current.handleNewChat();
    });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(1);
    });

    const newConversation = result.current.unfoldedConversations[0];

    expect(newConversation.title).toBe("New Conversation");
    expect(mockNavigate).toHaveBeenCalledWith(`/chat/${newConversation.id}`);
  });

  it("stays loading until the conversation and folder queries resolve", async () => {
    await seedConversation({ title: "Existing" });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unfoldedConversations).toHaveLength(1);
  });

  it("does not navigate when creating the conversation fails", async () => {
    vi.spyOn(db.conversations, "add").mockRejectedValue(
      new Error("write failed")
    );

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await act(async () => {
      await result.current.handleNewChat();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("matches search against message.content", async () => {
    await seedConversation({
      title: "Unrelated Title",
      messages: [
        createMockMessage({ content: "a discussion about svelte stores" }),
      ],
    });
    await seedConversation({
      title: "Another Unrelated Title",
      messages: [createMockMessage({ content: "nothing relevant here" })],
    });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(2);
    });

    act(() => {
      result.current.setSearchTerm("svelte");
    });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(1);
    });

    const conversation = result.current.unfoldedConversations[0];
    const [message] = conversation.messages;

    expect(conversation.title).toBe("Unrelated Title");
    expect(message.content).toBe("a discussion about svelte stores");
  });
});
