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

describe("useConversationList", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
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
});
