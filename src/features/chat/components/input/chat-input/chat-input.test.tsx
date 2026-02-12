import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/testing/utils";
import { ChatInput } from "./chat-input";
import { createMockModel } from "@/testing/mocks/factories";

vi.mock("@/app/providers/model-provider", async () => {
  const { createMinimalModelProvider } = await import("@/testing/mocks/providers");
  return createMinimalModelProvider();
});

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMinimalWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMinimalWebLLMProvider();
});

vi.mock("@/features/chat/hooks/use-speech-to-text", async () => {
  const { createMockSpeechToTextHook } = await import("@/testing/mocks/hooks");
  return {
    useSpeechToText: vi.fn(() => createMockSpeechToTextHook()),
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

  it("renders with correct structure", () => {
    render(<ChatInput {...defaultProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /attach/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it.each([
    { message: "", isLoading: false, expectedDisabled: true, desc: "empty message" },
    { message: "Hello", isLoading: false, expectedDisabled: false, desc: "has content" },
    { message: "Hello", isLoading: true, expectedDisabled: true, desc: "loading" },
  ])(
    "submit button disabled=$expectedDisabled when $desc",
    ({ message, isLoading, expectedDisabled }) => {
      render(<ChatInput {...defaultProps} message={message} isLoading={isLoading} />);

      const sendButton = screen.getByRole("button", { name: /send message/i });
      if (expectedDisabled) {
        expect(sendButton).toBeDisabled();
      } else {
        expect(sendButton).not.toBeDisabled();
      }
    }
  );

  it("disables textarea when loading", () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("shows stop button when generating", () => {
    render(<ChatInput {...defaultProps} isGenerating={true} />);

    expect(screen.getByRole("button", { name: /stop generation/i })).toBeInTheDocument();
  });

  it("disables submit when model has error", () => {
    vi.mocked(useModel).mockReturnValue({
      currentModel: createMockModel("online"),
      isModelLoading: false,
      modelStatus: "Error: Something went wrong",
    } as ReturnType<typeof useModel>);

    render(<ChatInput {...defaultProps} message="Hello" />);

    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });
});
