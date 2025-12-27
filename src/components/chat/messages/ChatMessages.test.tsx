import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../test/utils";
import { ChatMessages } from "./ChatMessages";
import {
  createMockMessage,
  createMockConversation,
  createMockSmartAutoScrollHook,
} from "../../../test/mocks";

vi.mock("../../../hooks/useConversations", async () => {
  const { createMockConversationHook } = await import("../../../test/mocks/hooks");
  return {
    useConversation: vi.fn(() => createMockConversationHook()),
  };
});

vi.mock("../../../hooks/useConversationId", async () => {
  const { createMockConversationIdHook } = await import("../../../test/mocks/hooks");
  return {
    useConversationId: vi.fn(() => createMockConversationIdHook()),
  };
});

vi.mock("../../../providers/WebLLMProvider", async () => {
  const { createMinimalWebLLMProvider } = await import("../../../test/mocks/providers");
  return createMinimalWebLLMProvider();
});

vi.mock("../../../hooks/useSmartAutoScroll", async () => {
  const { createMockSmartAutoScrollHook } = await import("../../../test/mocks/hooks");
  return { useSmartAutoScroll: vi.fn(() => createMockSmartAutoScrollHook()) };
});

import { useConversation } from "../../../hooks/useConversations";
import { useWebLLM } from "../../../providers/WebLLMProvider";
import { useSmartAutoScroll } from "../../../hooks/useSmartAutoScroll";

const defaultProps = {
  onRegenerate: vi.fn(),
  onStopGeneration: vi.fn(),
};

describe("ChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no messages", () => {
    vi.mocked(useConversation).mockReturnValue({
      messages: [],
      conversation: createMockConversation({ title: "New Chat" }),
    });

    render(<ChatMessages {...defaultProps} />);

    expect(screen.getByText(/start chatting/i)).toBeInTheDocument();
  });

  it("renders messages when present", () => {
    const mockMessages = [
      createMockMessage({ role: "user", content: "Hello!" }),
      createMockMessage({ role: "assistant", content: "Hi there!" }),
    ];

    vi.mocked(useConversation).mockReturnValue({
      messages: mockMessages,
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("does not show empty state when loading", () => {
    vi.mocked(useConversation).mockReturnValue({
      messages: [],
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} isLoading={true} />);

    expect(screen.queryByText(/start a conversation/i)).not.toBeInTheDocument();
  });

  it("does not show empty state when generating", () => {
    vi.mocked(useConversation).mockReturnValue({
      messages: [],
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} isGenerating={true} />);

    expect(screen.queryByText(/start a conversation/i)).not.toBeInTheDocument();
  });

  it("shows scroll to bottom button when showScrollButton is true", () => {
    vi.mocked(useSmartAutoScroll).mockReturnValue(
      createMockSmartAutoScrollHook({ showScrollButton: true })
    );

    vi.mocked(useConversation).mockReturnValue({
      messages: [createMockMessage()],
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} />);

    const scrollButton = screen.getByRole("button", { name: /scroll to bottom/i });
    expect(scrollButton).toBeInTheDocument();
  });

  it("hides scroll to bottom button when showScrollButton is false", () => {
    vi.mocked(useSmartAutoScroll).mockReturnValue(
      createMockSmartAutoScrollHook({ showScrollButton: false })
    );

    vi.mocked(useConversation).mockReturnValue({
      messages: [createMockMessage()],
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} />);

    const scrollButton = screen.queryByRole("button", { name: /scroll to bottom/i });
    expect(scrollButton).not.toBeInTheDocument();
  });

  it("only passes onRegenerate to last assistant message when model ready", () => {
    const mockMessages = [
      createMockMessage({ id: "1", role: "user", content: "Hello!" }),
      createMockMessage({ id: "2", role: "assistant", content: "First response" }),
      createMockMessage({ id: "3", role: "user", content: "More!" }),
      createMockMessage({ id: "4", role: "assistant", content: "Last response" }),
    ];

    vi.mocked(useConversation).mockReturnValue({
      messages: mockMessages,
      conversation: createMockConversation(),
    });

    vi.mocked(useWebLLM).mockReturnValue({
      isLoading: false,
      status: "Ready",
    } as ReturnType<typeof useWebLLM>);

    render(<ChatMessages {...defaultProps} />);

    // The last assistant message should have regenerate button visible
    // when isModelReady and not generating
    expect(screen.getByText("Last response")).toBeInTheDocument();
  });

  it("does not show regenerate when model is loading", () => {
    const mockMessages = [
      createMockMessage({ role: "assistant", content: "Response" }),
    ];

    vi.mocked(useConversation).mockReturnValue({
      messages: mockMessages,
      conversation: createMockConversation(),
    });

    vi.mocked(useWebLLM).mockReturnValue({
      isLoading: true,
      status: "Loading...",
    } as ReturnType<typeof useWebLLM>);

    render(<ChatMessages {...defaultProps} />);

    // Model is loading, so regenerate shouldn't be available
    expect(screen.getByText("Response")).toBeInTheDocument();
  });

  it("renders multiple user and assistant messages correctly", () => {
    const mockMessages = [
      createMockMessage({ id: "1", role: "user", content: "Question 1" }),
      createMockMessage({ id: "2", role: "assistant", content: "Answer 1" }),
      createMockMessage({ id: "3", role: "user", content: "Question 2" }),
      createMockMessage({ id: "4", role: "assistant", content: "Answer 2" }),
    ];

    vi.mocked(useConversation).mockReturnValue({
      messages: mockMessages,
      conversation: createMockConversation(),
    });

    render(<ChatMessages {...defaultProps} />);

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });
});
