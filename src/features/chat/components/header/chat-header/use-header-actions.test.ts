import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHeaderActions } from "./use-header-actions";
import { mockNavigate } from "@/testing/mocks/modules";
import { createMockConversation } from "@/testing/mocks/factories";
import type { Conversation } from "@/lib/db";

const mockTogglePinConversation = vi.fn();
const mockCreateEmptyConversation = vi.fn();

let mockConversations: Conversation[] = [];
let mockConversation: Conversation = createMockConversation({
  id: "conv-1",
  title: "Test Conversation",
});

vi.mock("@/hooks/use-conversations", async () => {
  const { createMockConversationsHook, createMockConversationHook } =
    await import("@/testing/mocks/hooks");
  return {
    useConversations: () =>
      createMockConversationsHook({
        conversations: mockConversations,
        togglePinConversation: mockTogglePinConversation,
        createEmptyConversation: mockCreateEmptyConversation,
      }),
    useConversation: () =>
      createMockConversationHook({
        conversation: mockConversation,
      }),
  };
});

vi.mock("@/hooks/use-conversation-backup", async () => {
  const { createMockConversationBackupHook } = await import(
    "@/testing/mocks/hooks"
  );
  return {
    useConversationBackup: () => createMockConversationBackupHook({}),
  };
});

// Sub-hook behaviors tested in: use-title-edit.test.ts, use-conversation-delete.test.ts

describe("useHeaderActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversations = [
      createMockConversation({
        id: "conv-1",
        title: "Test Conversation",
        pinned: false,
      }),
    ];
    mockConversation = createMockConversation({
      id: "conv-1",
      title: "Test Conversation",
    });
    mockCreateEmptyConversation.mockResolvedValue("new-conv-id");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates new conversation and navigates to it", async () => {
    const { result } = renderHook(() =>
      useHeaderActions({ conversationId: "conv-1" })
    );

    await act(async () => {
      await result.current.handleNewChat();
    });

    expect(mockCreateEmptyConversation).toHaveBeenCalledWith("New Conversation");
    expect(mockNavigate).toHaveBeenCalledWith("/chat/new-conv-id");
  });

  it("does not navigate when conversation creation fails", async () => {
    mockCreateEmptyConversation.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useHeaderActions({ conversationId: "conv-1" })
    );

    await act(async () => {
      await result.current.handleNewChat();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("toggles pin state for conversation", async () => {
    mockConversation = createMockConversation({
      id: "conv-1",
      title: "Pinned Conv",
      pinned: true,
    });

    const { result } = renderHook(() =>
      useHeaderActions({ conversationId: "conv-1" })
    );

    expect(result.current.isConversationPinned).toBe(true);

    await act(async () => {
      await result.current.handleTogglePinConversation();
    });

    expect(mockTogglePinConversation).toHaveBeenCalledWith("conv-1");
  });
});
