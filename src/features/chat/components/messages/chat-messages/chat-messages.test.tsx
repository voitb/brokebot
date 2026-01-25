import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { ChatMessages } from "./chat-messages";
import { createMockMessage, createMockConversation } from "@/testing/mocks/factories";
import type { UseChatMessagesReturn } from "./use-chat-messages";

vi.mock("./use-chat-messages");

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMinimalWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMinimalWebLLMProvider();
});

import { useChatMessages } from "./use-chat-messages";
import { useWebLLM } from "@/app/providers/web-llm-provider";

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
    vi.mocked(useWebLLM).mockReturnValue({
      isLoading: false,
      status: "Ready",
    } as ReturnType<typeof useWebLLM>);
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
});
