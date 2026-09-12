import { describe, it, expect, vi, beforeEach, onTestFinished } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { MessageBubble } from "./message-bubble";
import { createMockMessage } from "@/testing/mocks/modules";

describe("MessageBubble", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("keeps think tags verbatim in user messages", () => {
    const message = createMockMessage({
      role: "user",
      content: "<think>hidden</think>Summarise this",
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("<think>hidden</think>Summarise this")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Thinking" })).not.toBeInTheDocument();
  });

  it("renders an attachment badge instead of the file body for user messages", () => {
    const message = createMockMessage({
      role: "user",
      content: '<file name="notes.txt">secret body</file>Check this',
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText("Check this")).toBeInTheDocument();
    expect(screen.queryByText(/secret body/)).not.toBeInTheDocument();
  });

  it("renders a badge for each attachment when two files share a name", () => {
    const message = createMockMessage({
      role: "user",
      content:
        '<file name="notes.txt">first</file>\n\n<file name="notes.txt">second</file>Check this',
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    onTestFinished(() => consoleError.mockRestore());

    render(<MessageBubble message={message} />);

    expect(screen.getAllByText("notes.txt")).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
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
        isModelReady={true}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByRole("button", { name: /regenerate/i });
    expect(regenerateButton).toBeEnabled();
  });

  it("disables regenerate button when the model is not ready", () => {
    const message = createMockMessage({ role: "assistant", content: "Response" });

    render(
      <MessageBubble
        message={message}
        isGenerating={false}
        isLastMessage={true}
        isModelReady={false}
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
