import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatInput } from "./useChatInput";

const mockNavigate = vi.fn();
const mockCreateEmptyConversation = vi.fn();
const mockAddMessage = vi.fn();
const mockUpdateMessage = vi.fn();
const mockUpdateConversationTitle = vi.fn();
const mockStreamResponse = vi.fn();
const mockStopGeneration = vi.fn();

let mockConversationId: string | undefined = undefined;
let mockMessages: Array<{ id: string; role: string; content: string }> = [];
let mockCurrentModel: { type: string } | null = { type: "online" };
let mockIsGenerating = false;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../../hooks/useConversations", () => ({
  useConversations: () => ({
    createEmptyConversation: mockCreateEmptyConversation,
    addMessage: mockAddMessage,
    updateMessage: mockUpdateMessage,
    updateConversationTitle: mockUpdateConversationTitle,
  }),
  useConversation: () => ({
    messages: mockMessages,
  }),
}));

vi.mock("../../../../hooks/useConversationId", () => ({
  useConversationId: () => mockConversationId,
}));

vi.mock("../../../../providers/ModelProvider", () => ({
  useModel: () => ({
    currentModel: mockCurrentModel,
  }),
}));

vi.mock("./useMessageStream", () => ({
  useMessageStream: () => ({
    isGenerating: mockIsGenerating,
    streamResponse: mockStreamResponse,
    stopGeneration: mockStopGeneration,
  }),
}));

vi.mock("./useChatErrors", () => ({
  showErrorToast: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationId = undefined;
    mockMessages = [];
    mockCurrentModel = { type: "online" };
    mockIsGenerating = false;
    mockStreamResponse.mockResolvedValue({ content: "AI response", wasAborted: false });
    mockCreateEmptyConversation.mockResolvedValue("new-conversation-id");
    mockAddMessage.mockResolvedValue("message-id");
  });

  describe("initial state", () => {
    it("returns empty message initially", () => {
      const { result } = renderHook(() => useChatInput());
      expect(result.current.message).toBe("");
    });

    it("returns isLoading as false initially", () => {
      const { result } = renderHook(() => useChatInput());
      expect(result.current.isLoading).toBe(false);
    });

    it("returns isGenerating from useMessageStream", () => {
      mockIsGenerating = true;
      const { result } = renderHook(() => useChatInput());
      expect(result.current.isGenerating).toBe(true);
    });
  });

  describe("setMessage", () => {
    it("updates message state", () => {
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello world");
      });

      expect(result.current.message).toBe("Hello world");
    });
  });

  describe("handleMessageSubmit", () => {
    it("does nothing if message is empty", async () => {
      const { result } = renderHook(() => useChatInput());

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockCreateEmptyConversation).not.toHaveBeenCalled();
      expect(mockAddMessage).not.toHaveBeenCalled();
    });

    it("does nothing if message is only whitespace", async () => {
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("   ");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockCreateEmptyConversation).not.toHaveBeenCalled();
    });

    it("creates new conversation if none exists", async () => {
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockCreateEmptyConversation).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/chat/new-conversation-id");
    });

    it("uses existing conversation if available", async () => {
      mockConversationId = "existing-id";
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockCreateEmptyConversation).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("adds user message to conversation", async () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello AI");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockAddMessage).toHaveBeenCalledWith("test-id", {
        role: "user",
        content: "Hello AI",
      });
    });

    it("adds empty assistant message for streaming", async () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockAddMessage).toHaveBeenCalledWith("test-id", {
        role: "assistant",
        content: "",
      });
    });

    it("sets conversation title on first message", async () => {
      mockConversationId = "test-id";
      mockMessages = [];
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("This is my first message");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockUpdateConversationTitle).toHaveBeenCalledWith(
        "test-id",
        "This is my first message"
      );
    });

    it("truncates long titles to 50 chars", async () => {
      mockConversationId = "test-id";
      mockMessages = [];
      const longMessage = "A".repeat(100);
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage(longMessage);
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockUpdateConversationTitle).toHaveBeenCalledWith(
        "test-id",
        "A".repeat(50) + "..."
      );
    });

    it("clears message after submit", async () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(result.current.message).toBe("");
    });

    it("sets isLoading during submission and resets after", async () => {
      mockConversationId = "test-id";

      mockStreamResponse.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ content: "response", wasAborted: false }), 10);
        });
      });

      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("accepts custom message parameter", async () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useChatInput());

      await act(async () => {
        await result.current.handleMessageSubmit("Custom message");
      });

      expect(mockAddMessage).toHaveBeenCalledWith("test-id", {
        role: "user",
        content: "Custom message",
      });
    });

    it("streams response when model is available", async () => {
      mockConversationId = "test-id";
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockStreamResponse).toHaveBeenCalled();
    });

    it("does not stream if no model selected", async () => {
      mockConversationId = "test-id";
      mockCurrentModel = null;
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.setMessage("Hello");
      });

      await act(async () => {
        await result.current.handleMessageSubmit();
      });

      expect(mockStreamResponse).not.toHaveBeenCalled();
    });
  });

  describe("regenerateLastResponse", () => {
    it("does nothing if no conversation", async () => {
      mockConversationId = undefined;
      const { result } = renderHook(() => useChatInput());

      await act(async () => {
        await result.current.regenerateLastResponse();
      });

      expect(mockUpdateMessage).not.toHaveBeenCalled();
    });

    it("does nothing if less than 2 messages", async () => {
      mockConversationId = "test-id";
      mockMessages = [{ id: "1", role: "user", content: "Hello" }];
      const { result } = renderHook(() => useChatInput());

      await act(async () => {
        await result.current.regenerateLastResponse();
      });

      expect(mockStreamResponse).not.toHaveBeenCalled();
    });

    it("clears last AI message and regenerates", async () => {
      mockConversationId = "test-id";
      mockMessages = [
        { id: "1", role: "user", content: "Hello" },
        { id: "2", role: "assistant", content: "Hi there" },
      ];
      const { result } = renderHook(() => useChatInput());

      await act(async () => {
        await result.current.regenerateLastResponse();
      });

      expect(mockUpdateMessage).toHaveBeenCalledWith("test-id", "2", "");
      expect(mockStreamResponse).toHaveBeenCalled();
    });
  });

  describe("stopGeneration", () => {
    it("calls stopGeneration from useMessageStream", () => {
      const { result } = renderHook(() => useChatInput());

      act(() => {
        result.current.stopGeneration();
      });

      expect(mockStopGeneration).toHaveBeenCalled();
    });
  });
});
