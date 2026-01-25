import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatInput } from "./use-chat-input";
import { mockNavigate } from "@/testing/mocks/modules";
import { createMockModel, createMockModelContext } from "@/testing/mocks/factories";
import { createMockConversationsHook, createMockConversationHook, createMockMessageStreamHook } from "@/testing/mocks/hooks";

const mockConversations = createMockConversationsHook();
const mockStream = createMockMessageStreamHook();
let conversationId: string | undefined;
let messages: Array<{ id: string; role: string; content: string }> = [];

vi.mock("@/hooks/use-conversations", () => ({
  useConversations: () => mockConversations,
  useConversation: () => createMockConversationHook({ messages }),
}));
vi.mock("@/hooks/use-conversation-id", () => ({ useConversationId: () => conversationId }));
vi.mock("@/app/providers/model-provider", () => ({
  useModel: () => createMockModelContext({ currentModel: createMockModel("online") }),
}));
vi.mock("./use-message-stream", () => ({ useMessageStream: () => mockStream }));

describe("useChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conversationId = undefined;
    messages = [];
    mockStream.streamResponse.mockResolvedValue({ content: "response", wasAborted: false });
    mockConversations.createEmptyConversation.mockResolvedValue("new-id");
  });

  it("guards empty message", async () => {
    const { result } = renderHook(() => useChatInput());
    await act(async () => result.current.handleMessageSubmit());
    expect(mockConversations.createEmptyConversation).not.toHaveBeenCalled();
  });

  it("creates conversation and navigates for new chat", async () => {
    const { result } = renderHook(() => useChatInput());
    act(() => result.current.setMessage("Hello"));
    await act(async () => result.current.handleMessageSubmit());
    expect(mockNavigate).toHaveBeenCalledWith("/chat/new-id");
    expect(result.current.message).toBe("");
  });

  it("uses existing conversation without creating new", async () => {
    conversationId = "existing";
    const { result } = renderHook(() => useChatInput());
    act(() => result.current.setMessage("Hello"));
    await act(async () => result.current.handleMessageSubmit());
    expect(mockConversations.createEmptyConversation).not.toHaveBeenCalled();
  });

  it("regeneration requires messages", async () => {
    const { result } = renderHook(() => useChatInput());
    await act(async () => result.current.regenerateLastResponse());
    expect(mockStream.streamResponse).not.toHaveBeenCalled();
  });
});
