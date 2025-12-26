import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useConversationList } from "./useConversationList";
import { ConversationsProvider } from "../../../../providers/ConversationsProvider";
import {
  clearTestDatabase,
  seedConversation,
  seedFolder,
} from "../../../../test/db-helpers";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

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

  it("returns empty data initially", async () => {
    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.pinnedConversations).toEqual([]);
      expect(result.current.unfoldedConversations).toEqual([]);
    });
  });

  it("separates pinned conversations", async () => {
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

  it("updates search term with transition", async () => {
    const { result } = renderHook(() => useConversationList(), { wrapper });

    act(() => {
      result.current.setSearchTerm("test");
    });

    expect(result.current.searchTerm).toBe("test");

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });

  it("filters by title match", async () => {
    await seedConversation({ title: "React Help" });
    await seedConversation({ title: "Vue Tips" });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(2);
    });

    act(() => {
      result.current.setSearchTerm("react");
    });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(1);
    });

    expect(result.current.unfoldedConversations[0].title).toBe("React Help");
  });

  it("clears search term when set to empty", async () => {
    const { result } = renderHook(() => useConversationList(), { wrapper });

    act(() => {
      result.current.setSearchTerm("test");
    });

    expect(result.current.searchTerm).toBe("test");

    act(() => {
      result.current.setSearchTerm("");
    });

    expect(result.current.searchTerm).toBe("");

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });

  it("sorts conversations by updatedAt", async () => {
    await seedConversation({
      title: "Older",
      updatedAt: new Date("2024-01-01"),
    });
    await seedConversation({
      title: "Newer",
      updatedAt: new Date("2024-12-01"),
    });

    const { result } = renderHook(() => useConversationList(), { wrapper });

    await waitFor(() => {
      expect(result.current.unfoldedConversations).toHaveLength(2);
    });

    expect(result.current.unfoldedConversations[0].title).toBe("Newer");
    expect(result.current.unfoldedConversations[1].title).toBe("Older");
  });
});
