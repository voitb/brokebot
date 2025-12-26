import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatInput } from "./ChatInput";

vi.mock("../../../providers/ModelProvider", () => ({
  useModel: vi.fn(() => ({
    currentModel: { name: "Test Model", type: "online" },
    isModelLoading: false,
    modelStatus: "Ready",
  })),
}));

vi.mock("../../../providers/WebLLMProvider", () => {
  const mockModel = {
    id: "test-model",
    name: "Test Model",
    size: "1B",
    description: "Test model",
    ramRequirement: "1GB",
    downloadSize: "~500MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  };
  return {
    useWebLLM: vi.fn(() => ({
      engine: null,
      isLoading: false,
      progress: 1,
      status: "Ready",
      selectedModel: mockModel,
      availableModels: [mockModel],
      setSelectedModel: vi.fn(),
      loadModel: vi.fn(),
    })),
    AVAILABLE_MODELS: [mockModel],
  };
});

vi.mock("./hooks", () => ({
  useDragDrop: vi.fn(() => ({
    isDragOver: false,
    handleDrop: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDragEnter: vi.fn(),
  })),
  useFileUpload: vi.fn(() => ({
    processFile: vi.fn(),
  })),
  useSpeechToText: vi.fn(() => ({
    status: "ready",
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    isModelLoading: false,
    error: null,
  })),
}));

import { useModel } from "../../../providers/ModelProvider";

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
