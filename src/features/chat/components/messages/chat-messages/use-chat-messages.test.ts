import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useChatMessages } from "./use-chat-messages";
import type { Message } from "@/lib/db";

// Mock external dependencies
vi.mock("@/hooks/use-conversations", async () => {
  const { createMockConversationHook } = await import("@/testing/mocks/hooks");
  return {
    useConversation: vi.fn(() => createMockConversationHook()),
  };
});

vi.mock("@/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks")>();
  return {
    ...actual,
    useConversationId: vi.fn(() => "test-conversation-id"),
  };
});

vi.mock("@/features/chat/hooks/use-smart-auto-scroll", async () => {
  const { createMockSmartAutoScrollHook } = await import("@/testing/mocks/hooks");
  return {
    useSmartAutoScroll: vi.fn(() => createMockSmartAutoScrollHook()),
  };
});

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMockWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMockWebLLMProvider();
});

// Import mocked hooks for manipulation
import { useConversation } from "@/hooks/use-conversations";
import { useSmartAutoScroll } from "@/features/chat/hooks/use-smart-auto-scroll";
import { useWebLLM } from "@/app/providers/web-llm-provider";

const defaultProps = {
  isGenerating: false,
  onRegenerate: vi.fn(),
  onStopGeneration: vi.fn(),
};

function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "msg-1",
    role: "user",
    content: "Hello",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("useChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("derived state", () => {
    it("returns messages from useConversation", () => {
      const messages = [createMockMessage({ id: "1", content: "Test" })];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      const { result } = renderHook(() => useChatMessages(defaultProps));

      expect(result.current.messages).toEqual(messages);
    });

    it("computes isModelReady when status is Ready and not loading", () => {
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: false,
        status: "Ready",
      } as ReturnType<typeof useWebLLM>);

      const { result } = renderHook(() => useChatMessages(defaultProps));

      expect(result.current.isModelReady).toBe(true);
    });

    it("computes isModelReady as false when loading", () => {
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: true,
        status: "Loading...",
      } as ReturnType<typeof useWebLLM>);

      const { result } = renderHook(() => useChatMessages(defaultProps));

      expect(result.current.isModelReady).toBe(false);
    });

    it("computes isModelReady as false when status is not Ready", () => {
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: false,
        status: "Error",
      } as ReturnType<typeof useWebLLM>);

      const { result } = renderHook(() => useChatMessages(defaultProps));

      expect(result.current.isModelReady).toBe(false);
    });
  });

  describe("scroll functionality", () => {
    it("passes correct options to useSmartAutoScroll", () => {
      const messages = [createMockMessage()];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      renderHook(() =>
        useChatMessages({ ...defaultProps, isGenerating: true })
      );

      expect(useSmartAutoScroll).toHaveBeenCalledWith({
        messageCount: 1,
        isGenerating: true,
        conversationId: "test-conversation-id",
      });
    });

    it("returns scroll controls from useSmartAutoScroll", () => {
      const mockScrollClick = vi.fn();
      vi.mocked(useSmartAutoScroll).mockReturnValue({
        scrollAreaRef: { current: null },
        showScrollButton: true,
        handleScrollToBottomClick: mockScrollClick,
      });

      const { result } = renderHook(() => useChatMessages(defaultProps));

      expect(result.current.showScrollButton).toBe(true);
      expect(result.current.handleScrollToBottomClick).toBe(mockScrollClick);
    });
  });

  describe("getMessageBubbleProps", () => {
    it("returns correct props for non-last user message", () => {
      const messages = [
        createMockMessage({ id: "1", role: "user" }),
        createMockMessage({ id: "2", role: "assistant" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      const { result } = renderHook(() => useChatMessages(defaultProps));
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.isLastMessage).toBe(false);
      expect(props.onRegenerate).toBeUndefined();
      expect(props.onStopGeneration).toBeUndefined();
    });

    it("returns correct props for last user message", () => {
      const messages = [createMockMessage({ id: "1", role: "user" })];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      const { result } = renderHook(() => useChatMessages(defaultProps));
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.isLastMessage).toBe(true);
      expect(props.onRegenerate).toBeUndefined();
      expect(props.onStopGeneration).toBeUndefined();
    });

    it("returns onRegenerate for last assistant message when model is ready", () => {
      const messages = [
        createMockMessage({ id: "1", role: "assistant" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: false,
        status: "Ready",
      } as ReturnType<typeof useWebLLM>);

      const onRegenerate = vi.fn();
      const { result } = renderHook(() =>
        useChatMessages({ ...defaultProps, onRegenerate })
      );
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.onRegenerate).toBe(onRegenerate);
    });

    it("does not return onRegenerate for last assistant message when model is not ready", () => {
      const messages = [
        createMockMessage({ id: "1", role: "assistant" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: true,
        status: "Loading...",
      } as ReturnType<typeof useWebLLM>);

      const { result } = renderHook(() => useChatMessages(defaultProps));
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.onRegenerate).toBeUndefined();
    });

    it("returns onStopGeneration for last assistant message when generating", () => {
      const messages = [
        createMockMessage({ id: "1", role: "assistant" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      const onStopGeneration = vi.fn();
      const { result } = renderHook(() =>
        useChatMessages({ ...defaultProps, isGenerating: true, onStopGeneration })
      );
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.onStopGeneration).toBe(onStopGeneration);
    });

    it("does not return onStopGeneration when not generating", () => {
      const messages = [
        createMockMessage({ id: "1", role: "assistant" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });

      const { result } = renderHook(() =>
        useChatMessages({ ...defaultProps, isGenerating: false })
      );
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.onStopGeneration).toBeUndefined();
    });

    it("does not return onRegenerate for non-last assistant message", () => {
      const messages = [
        createMockMessage({ id: "1", role: "assistant" }),
        createMockMessage({ id: "2", role: "user" }),
      ];
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages,
      });
      vi.mocked(useWebLLM).mockReturnValue({
        isLoading: false,
        status: "Ready",
      } as ReturnType<typeof useWebLLM>);

      const { result } = renderHook(() => useChatMessages(defaultProps));
      const props = result.current.getMessageBubbleProps(messages[0], 0);

      expect(props.onRegenerate).toBeUndefined();
    });

    it("includes message and isGenerating in props", () => {
      const message = createMockMessage({ id: "1", content: "Test content" });
      vi.mocked(useConversation).mockReturnValue({
        conversation: undefined,
        messages: [message],
      });

      const { result } = renderHook(() =>
        useChatMessages({ ...defaultProps, isGenerating: true })
      );
      const props = result.current.getMessageBubbleProps(message, 0);

      expect(props.message).toBe(message);
      expect(props.isGenerating).toBe(true);
    });
  });
});
