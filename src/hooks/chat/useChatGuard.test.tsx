import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useChatGuard } from "./useChatGuard";
import { ConversationsProvider } from "../../providers/ConversationsProvider";
import { clearTestDatabase, seedConversation } from "../../test/db-helpers";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("useChatGuard", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConversationsProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ConversationsProvider>
  );

  it("returns conversationExists=true when no conversationId provided", () => {
    const { result } = renderHook(() => useChatGuard({}), { wrapper });

    expect(result.current.conversationExists).toBe(true);
    expect(result.current.isChecking).toBe(false);
  });

  it("returns isChecking=true initially when conversationId provided", () => {
    const { result } = renderHook(
      () => useChatGuard({ conversationId: "some-id" }),
      { wrapper }
    );

    expect(result.current.isChecking).toBe(true);
  });

  it("returns conversationExists=true when conversation is found", async () => {
    const conv = await seedConversation({ title: "Test Conversation" });

    const { result } = renderHook(
      () => useChatGuard({ conversationId: conv.id }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.conversationExists).toBe(true);
      expect(result.current.isChecking).toBe(false);
    });
  });

  it("clears timeout when conversation is found before timeout", async () => {
    const { toast } = await import("sonner");
    const conv = await seedConversation({ title: "Found Conversation" });

    const { result } = renderHook(
      () => useChatGuard({ conversationId: conv.id, timeoutMs: 100 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.conversationExists).toBe(true);
    });

    // Wait longer than timeout to ensure it was cleared
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("useChatGuard timeout behavior", () => {
  // These tests mock useConversation to avoid database async operations
  // that conflict with fake timers
  const mockUseConversation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUseConversation.mockReturnValue({ conversation: undefined });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const simpleWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it("shows error toast and navigates when conversation not found after timeout", async () => {
    vi.doMock("../useConversations", () => ({
      useConversation: mockUseConversation,
    }));

    const { toast } = await import("sonner");
    const { useChatGuard: useChatGuardMocked } = await import("./useChatGuard");

    renderHook(
      () => useChatGuardMocked({ conversationId: "nonexistent-id", timeoutMs: 100 }),
      { wrapper: simpleWrapper }
    );

    await vi.advanceTimersByTimeAsync(100);

    expect(toast.error).toHaveBeenCalledWith("Conversation not found", {
      description: "The requested conversation does not exist.",
      duration: 4000,
    });
    expect(mockNavigate).toHaveBeenCalledWith("/chat", { replace: true });

    vi.doUnmock("../useConversations");
  });

  it("respects custom timeoutMs", async () => {
    vi.doMock("../useConversations", () => ({
      useConversation: mockUseConversation,
    }));

    const { toast } = await import("sonner");
    const { useChatGuard: useChatGuardMocked } = await import("./useChatGuard");

    renderHook(
      () => useChatGuardMocked({ conversationId: "nonexistent-id", timeoutMs: 1000 }),
      { wrapper: simpleWrapper }
    );

    await vi.advanceTimersByTimeAsync(500);
    expect(toast.error).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    expect(toast.error).toHaveBeenCalled();

    vi.doUnmock("../useConversations");
  });
});
