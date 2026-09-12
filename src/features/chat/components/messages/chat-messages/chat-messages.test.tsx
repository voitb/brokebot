import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render, renderHook } from "@/testing/utils";
import { ChatMessages } from "./chat-messages";
import {
  createMockMessage,
  createMockConversation,
  createMockModel,
  createMockModelContext,
} from "@/testing/mocks/factories";
import {
  createMockConversationIdHook,
  createMockSmartAutoScrollHook,
} from "@/testing/mocks/hooks";
import { ActiveConversationContext } from "@/features/chat/hooks/use-active-conversation";
import type { UseChatMessagesReturn } from "./use-chat-messages";

vi.mock("./use-chat-messages");

vi.mock("@/app/providers/model-provider", () => ({
  useModel: () => modelContext,
}));

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: vi.fn(),
}));

vi.mock("@/features/chat/hooks/use-smart-auto-scroll", () => ({
  useSmartAutoScroll: vi.fn(),
}));

import { useChatMessages } from "./use-chat-messages";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useSmartAutoScroll } from "@/features/chat/hooks/use-smart-auto-scroll";

const { useChatMessages: useChatMessagesActual } = await vi.importActual<
  typeof import("./use-chat-messages")
>("./use-chat-messages");

let modelContext = createMockModelContext();

function createMockUseChatMessages(
  overrides: Partial<UseChatMessagesReturn> = {}
): UseChatMessagesReturn {
  const messages = overrides.messages ?? [];
  return {
    messages,
    conversation: createMockConversation(),
    isModelReady: true,
    scrollAreaRef: { current: null },
    showScrollButton: false,
    handleScrollToBottomClick: vi.fn(),
    getMessageBubbleProps: vi.fn((message, index) => ({
      message,
      isGenerating: false,
      isLastMessage: index === messages.length - 1,
    })),
    ...overrides,
  };
}

const defaultProps = {
  onRegenerate: vi.fn(),
  onStopGeneration: vi.fn(),
};

describe("ChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChatMessages).mockReturnValue(createMockUseChatMessages());
  });

  it("renders empty state when no messages and not loading", () => {
    render(<ChatMessages {...defaultProps} />);

    expect(screen.getByText(/start chatting/i)).toBeInTheDocument();
  });

  it.each([
    { isLoading: true, isGenerating: false },
    { isLoading: false, isGenerating: true },
  ])(
    "hides empty state when loading=$isLoading or generating=$isGenerating",
    ({ isLoading, isGenerating }) => {
      render(<ChatMessages {...defaultProps} isLoading={isLoading} isGenerating={isGenerating} />);

      expect(screen.queryByText(/start chatting/i)).not.toBeInTheDocument();
    }
  );

  it.each([
    {
      description: "single message pair",
      messages: [
        createMockMessage({ role: "user", content: "Hello!" }),
        createMockMessage({ role: "assistant", content: "Hi there!" }),
      ],
      expectedTexts: ["Hello!", "Hi there!"],
    },
    {
      description: "full conversation thread",
      messages: [
        createMockMessage({ id: "1", role: "user", content: "Question 1" }),
        createMockMessage({ id: "2", role: "assistant", content: "Answer 1" }),
        createMockMessage({ id: "3", role: "user", content: "Question 2" }),
        createMockMessage({ id: "4", role: "assistant", content: "Answer 2" }),
      ],
      expectedTexts: ["Question 1", "Answer 1", "Question 2", "Answer 2"],
    },
  ])("renders messages: $description", ({ messages, expectedTexts }) => {
    vi.mocked(useChatMessages).mockReturnValue(createMockUseChatMessages({ messages }));

    render(<ChatMessages {...defaultProps} />);

    expectedTexts.forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("presents the transcript as a labelled log that does not announce updates", () => {
    render(<ChatMessages {...defaultProps} />);

    const transcript = screen.getByRole("log", { name: "Chat messages" });

    expect(transcript).toBeInTheDocument();
    expect(transcript).not.toHaveAttribute("aria-live");
  });
});

describe("useChatMessages", () => {
  const messages = [
    createMockMessage({ id: "message-1", role: "user", content: "Hello!" }),
    createMockMessage({ id: "message-2", role: "assistant", content: "Hi there!" }),
  ];
  const onRegenerate = vi.fn();
  const onStopGeneration = vi.fn();

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <ActiveConversationContext.Provider
        value={{ conversation: createMockConversation({ messages }), messages }}
      >
        {children}
      </ActiveConversationContext.Provider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    modelContext = createMockModelContext();
    vi.mocked(useConversationId).mockReturnValue(createMockConversationIdHook());
    vi.mocked(useSmartAutoScroll).mockReturnValue(createMockSmartAutoScrollHook());
  });

  it("offers regenerate on the last assistant message while the model is not ready", () => {
    modelContext = createMockModelContext({ currentModel: null, isModelLoading: true });

    const { result } = renderHook(
      () => useChatMessagesActual({ isGenerating: false, onRegenerate, onStopGeneration }),
      { wrapper }
    );

    const assistantProps = result.current.getMessageBubbleProps(messages[1], 1);

    expect(assistantProps.onRegenerate).toBe(onRegenerate);
    expect(assistantProps.onStopGeneration).toBeUndefined();
    expect(assistantProps.isModelReady).toBe(false);
  });

  it("reports the model as ready once a model is selected and loaded", () => {
    modelContext = createMockModelContext({
      currentModel: createMockModel("online"),
      isModelLoading: false,
    });

    const { result } = renderHook(
      () => useChatMessagesActual({ isGenerating: false, onRegenerate, onStopGeneration }),
      { wrapper }
    );

    expect(result.current.getMessageBubbleProps(messages[1], 1).isModelReady).toBe(true);
  });

  it("offers stop instead of regenerate while a response is streaming", () => {
    const { result } = renderHook(
      () => useChatMessagesActual({ isGenerating: true, onRegenerate, onStopGeneration }),
      { wrapper }
    );

    const assistantProps = result.current.getMessageBubbleProps(messages[1], 1);

    expect(assistantProps.onStopGeneration).toBe(onStopGeneration);
    expect(assistantProps.onRegenerate).toBeUndefined();
  });

  it("leaves the earlier user message without regenerate or stop actions", () => {
    const { result } = renderHook(
      () => useChatMessagesActual({ isGenerating: false, onRegenerate, onStopGeneration }),
      { wrapper }
    );

    const userProps = result.current.getMessageBubbleProps(messages[0], 0);
    const assistantProps = result.current.getMessageBubbleProps(messages[1], 1);

    expect(userProps.onRegenerate).toBeUndefined();
    expect(userProps.onStopGeneration).toBeUndefined();
    expect(userProps.isLastMessage).toBe(false);
    expect(assistantProps.isLastMessage).toBe(true);
  });
});
