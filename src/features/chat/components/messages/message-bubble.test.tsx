import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { MessageBubble } from "./message-bubble";
import { createMockMessage } from "@/testing/mocks/modules";

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMinimalWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMinimalWebLLMProvider();
});

import { useWebLLM } from "@/app/providers/web-llm-provider";

describe("MessageBubble", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWebLLM).mockReturnValue({
      isLoading: false,
      status: "Ready",
    } as ReturnType<typeof useWebLLM>);
  });

  it("renders user message content", () => {
    const message = createMockMessage({ role: "user", content: "Hello world" });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders assistant message content", () => {
    const message = createMockMessage({ role: "assistant", content: "Hi there!" });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("renders user avatar for user messages", () => {
    const message = createMockMessage({ role: "user", content: "Test" });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("💸")).toBeInTheDocument();
  });

  it("renders AI avatar for assistant messages", () => {
    const message = createMockMessage({ role: "assistant", content: "Test" });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("🤖")).toBeInTheDocument();
  });

  it("shows generating indicator when generating with no content", () => {
    const message = createMockMessage({ role: "assistant", content: "" });

    render(
      <MessageBubble
        message={message}
        isGenerating={true}
        isLastMessage={true}
      />
    );

    expect(screen.getByText(/responding/i)).toBeInTheDocument();
  });

  it("shows message content when generating with content", () => {
    const message = createMockMessage({ role: "assistant", content: "Partial response" });

    render(
      <MessageBubble
        message={message}
        isGenerating={true}
        isLastMessage={true}
      />
    );

    expect(screen.getByText("Partial response")).toBeInTheDocument();
  });

  it("renders thinking section for assistant messages with think tags", () => {
    const message = createMockMessage({
      role: "assistant",
      content: "<think>Let me think about this...</think>Here is my response.",
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Here is my response.")).toBeInTheDocument();
    expect(screen.getByText(/let me think about this/i)).toBeInTheDocument();
  });

  it("shows stop button when generating", () => {
    const mockOnStop = vi.fn();
    const message = createMockMessage({ role: "assistant", content: "Generating..." });

    render(
      <MessageBubble
        message={message}
        isGenerating={true}
        isLastMessage={true}
        onStopGeneration={mockOnStop}
      />
    );

    const stopButton = screen.getByRole("button", { name: /stop/i });
    expect(stopButton).toBeInTheDocument();
  });

  it("shows regenerate button for last AI message when model ready and not generating", () => {
    const mockOnRegenerate = vi.fn();
    const message = createMockMessage({ role: "assistant", content: "Response" });

    render(
      <MessageBubble
        message={message}
        isGenerating={false}
        isLastMessage={true}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByRole("button", { name: /regenerate/i });
    expect(regenerateButton).toBeInTheDocument();
  });

  it("disables regenerate button when model is loading", () => {
    vi.mocked(useWebLLM).mockReturnValue({
      isLoading: true,
      status: "Loading...",
    } as ReturnType<typeof useWebLLM>);

    const message = createMockMessage({ role: "assistant", content: "Response" });

    render(
      <MessageBubble
        message={message}
        isGenerating={false}
        isLastMessage={true}
        onRegenerate={vi.fn()}
      />
    );

    const regenerateButton = screen.getByRole("button", { name: /regenerate/i });
    expect(regenerateButton).toBeDisabled();
  });

  it("does not show regenerate button when not last message", () => {
    const message = createMockMessage({ role: "assistant", content: "Response" });

    render(
      <MessageBubble
        message={message}
        isGenerating={false}
        isLastMessage={false}
        onRegenerate={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /regenerate/i })).not.toBeInTheDocument();
  });

  it("renders message timestamp", () => {
    const testDate = new Date("2024-12-25T10:30:00");
    const message = createMockMessage({
      role: "user",
      content: "Test",
      createdAt: testDate,
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });
});
