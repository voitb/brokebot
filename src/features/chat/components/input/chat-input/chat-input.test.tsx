import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/testing/utils";
import { ChatInput } from "./chat-input";

vi.mock("@/app/providers/model-provider", async () => {
  const { createMinimalModelProvider } = await import("@/testing/mocks/providers");
  return createMinimalModelProvider();
});

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMockWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMockWebLLMProvider();
});

vi.mock("@/features/chat/hooks/use-drag-drop", async () => {
  const { createMockDragDropHook } = await import("@/testing/mocks/hooks");
  return { useDragDrop: vi.fn(() => createMockDragDropHook()) };
});

vi.mock("@/features/chat/hooks/use-file-upload", async () => {
  const { createMockFileUploadHook } = await import("@/testing/mocks/hooks");
  return { useFileUpload: vi.fn(() => createMockFileUploadHook()) };
});

vi.mock("@/features/chat/hooks/use-speech-to-text", async () => {
  const { createMockSpeechToTextHook } = await import("@/testing/mocks/hooks");
  return {
    useSpeechToText: vi.fn(() => createMockSpeechToTextHook()),
    useTranscriberToasts: vi.fn(),
  };
});

import { useModel } from "@/app/providers/model-provider";

const defaultProps = {
  message: "",
  setMessage: vi.fn(),
  isLoading: false,
  isGenerating: false,
  onSend: vi.fn().mockResolvedValue(undefined),
  onStopGeneration: vi.fn(),
};

describe("ChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea with placeholder showing model name when ready", () => {
    render(<ChatInput {...defaultProps} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      "placeholder",
      expect.stringContaining("Test Model")
    );
  });

  it("renders textarea with model status when not ready", () => {
    vi.mocked(useModel).mockReturnValue({
      currentModel: null,
      isModelLoading: true,
      modelStatus: "Loading model...",
    } as ReturnType<typeof useModel>);

    render(<ChatInput {...defaultProps} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Loading model...");
  });

  it("disables submit button when message is empty", () => {
    render(<ChatInput {...defaultProps} message="" />);

    const allButtons = screen.getAllByRole("button");
    const sendButton = allButtons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).toBeDisabled();
  });

  it("enables submit button when message has content", () => {
    render(<ChatInput {...defaultProps} message="Hello" />);

    const allButtons = screen.getAllByRole("button");
    const sendButton = allButtons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).not.toBeDisabled();
  });

  it("disables submit button when loading", () => {
    render(<ChatInput {...defaultProps} message="Hello" isLoading={true} />);

    const allButtons = screen.getAllByRole("button");
    const sendButton = allButtons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).toBeDisabled();
  });

  it("disables textarea when loading", () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("shows stop button when generating", () => {
    render(<ChatInput {...defaultProps} isGenerating={true} />);

    const allButtons = screen.getAllByRole("button");
    const stopButton = allButtons.find(
      (btn) => btn.className.includes("destructive")
    );
    expect(stopButton).toBeDefined();
  });

  it("does not submit when model has error", () => {
    vi.mocked(useModel).mockReturnValue({
      currentModel: { name: "Test Model", type: "online" },
      isModelLoading: false,
      modelStatus: "Error: Something went wrong",
    } as ReturnType<typeof useModel>);

    render(<ChatInput {...defaultProps} message="Hello" />);

    const allButtons = screen.getAllByRole("button");
    const sendButton = allButtons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).toBeDisabled();
  });

  it("renders with correct structure", () => {
    render(<ChatInput {...defaultProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByTitle("Attach files")).toBeInTheDocument();

    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBeGreaterThan(0);
  });
});
