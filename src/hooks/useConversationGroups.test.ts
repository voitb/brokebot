import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConversationGroups } from "./useConversationGroups";
import { createMockConversation } from "../test/mocks/factories";

describe("useConversationGroups", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array for null conversations", () => {
    const { result } = renderHook(() => useConversationGroups(null));
    expect(result.current.filteredGroups).toEqual([]);
  });

  it("returns empty array for empty conversations", () => {
    const { result } = renderHook(() => useConversationGroups([]));
    expect(result.current.filteredGroups).toEqual([]);
  });

  it("groups pinned into Favourites", () => {
    const pinned = createMockConversation({ pinned: true });
    const { result } = renderHook(() => useConversationGroups([pinned]));
    expect(result.current.filteredGroups[0].label).toBe("Favourites");
  });

  it("groups today's conversations", () => {
    const today = createMockConversation({
      updatedAt: new Date("2025-01-15T10:00:00"),
      pinned: false,
    });
    const { result } = renderHook(() => useConversationGroups([today]));
    expect(result.current.filteredGroups[0].label).toBe("Today");
  });

  it("groups yesterday's conversations", () => {
    const yesterday = createMockConversation({
      updatedAt: new Date("2025-01-14T10:00:00"),
      pinned: false,
    });
    const { result } = renderHook(() => useConversationGroups([yesterday]));
    expect(result.current.filteredGroups[0].label).toBe("Yesterday");
  });

  it("groups last 7 days conversations", () => {
    const lastWeek = createMockConversation({
      updatedAt: new Date("2025-01-10T10:00:00"),
      pinned: false,
    });
    const { result } = renderHook(() => useConversationGroups([lastWeek]));
    expect(result.current.filteredGroups[0].label).toBe("Last 7 Days");
  });

  it("groups older conversations", () => {
    const older = createMockConversation({
      updatedAt: new Date("2025-01-01T10:00:00"),
      pinned: false,
    });
    const { result } = renderHook(() => useConversationGroups([older]));
    expect(result.current.filteredGroups[0].label).toBe("Older");
  });

  it("filters by search query", () => {
    const conv = createMockConversation({
      title: "React Testing",
      pinned: false,
      updatedAt: new Date("2025-01-15T10:00:00"),
    });
    const { result } = renderHook(() => useConversationGroups([conv], "react"));
    expect(result.current.filteredGroups[0].conversations).toHaveLength(1);
  });

  it("removes empty groups after filtering", () => {
    const conv = createMockConversation({
      title: "React Testing",
      pinned: false,
      updatedAt: new Date("2025-01-15T10:00:00"),
    });
    const { result } = renderHook(() => useConversationGroups([conv], "vue"));
    expect(result.current.filteredGroups).toHaveLength(0);
  });

  it("search is case insensitive", () => {
    const conv = createMockConversation({
      title: "React Testing",
      pinned: false,
      updatedAt: new Date("2025-01-15T10:00:00"),
    });
    const { result } = renderHook(() => useConversationGroups([conv], "REACT"));
    expect(result.current.filteredGroups[0].conversations).toHaveLength(1);
  });

  it("handles mixed pinned and unpinned conversations", () => {
    const pinned = createMockConversation({
      title: "Pinned Chat",
      pinned: true,
      updatedAt: new Date("2025-01-15T10:00:00"),
    });
    const unpinned = createMockConversation({
      title: "Regular Chat",
      pinned: false,
      updatedAt: new Date("2025-01-15T08:00:00"),
    });
    const { result } = renderHook(() =>
      useConversationGroups([pinned, unpinned])
    );

    expect(result.current.filteredGroups[0].label).toBe("Favourites");
    expect(result.current.filteredGroups[1].label).toBe("Today");
  });
});
