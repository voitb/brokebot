import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useChatGuard } from "./use-chat-guard";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { clearTestDatabase, seedConversation } from "@/testing/db-helpers";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConversationsProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ConversationsProvider>
  );
}

describe("useChatGuard", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  it("returns conversationExists=true when no conversationId provided", () => {
    const { result } = renderHook(() => useChatGuard({}), { wrapper });

    expect(result.current.conversationExists).toBe(true);
  });

  it("returns conversationExists=true when conversation is found", async () => {
    const conv = await seedConversation({ title: "Test Conversation" });

    const { result } = renderHook(
      () => useChatGuard({ conversationId: conv.id }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.conversationExists).toBe(true);
    });

    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows error and navigates when conversation not found", async () => {
    renderHook(
      () => useChatGuard({ conversationId: "nonexistent-id", timeoutMs: 10 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Conversation not found", {
        description: "The requested conversation does not exist.",
        duration: 4000,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/chat", { replace: true });
  });
});
