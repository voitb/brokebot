import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@/testing/utils";
import { ChatInput } from "./chat-input";
import { endGeneration, startGeneration } from "@/features/chat/hooks/active-generations";
import { createMockModel, createMockModelContext } from "@/testing/mocks/factories";
import { createMockFile } from "@/testing/mocks/modules";
import type { UnifiedModel } from "@/app/providers/model-provider";

vi.mock("@/app/providers/model-provider", async () => {
  const { createMockModelProvider } = await import("@/testing/mocks/providers");
  return createMockModelProvider();
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

function mockModelContext(overrides: Parameters<typeof createMockModelContext>[0]) {
  vi.mocked(useModel).mockReturnValue({
    ...createMockModelContext(overrides),
    setCurrentModel: vi.fn<(model: UnifiedModel) => void>(),
    interruptGeneration: vi.fn<() => void>(),
  });
}

const startedGenerations: [string, AbortController][] = [];

function beginGeneration(conversationId: string) {
  const controller = new AbortController();
  startedGenerations.push([conversationId, controller]);
  act(() => startGeneration(conversationId, controller));
}

function endStartedGenerations() {
  act(() => {
    for (const [conversationId, controller] of startedGenerations) {
      endGeneration(conversationId, controller);
    }
  });
  startedGenerations.length = 0;
}

describe("ChatInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    endStartedGenerations();
    window.history.pushState({}, "", "/");
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

  it("hides attached file chips while a send is in flight", async () => {
    const { container, rerender } = render(<ChatInput {...defaultProps} message="Hello" />);

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [createMockFile("notes.txt", "body")] },
    });

    await waitFor(() => expect(screen.getByText("notes.txt")).toBeInTheDocument());

    rerender(<ChatInput {...defaultProps} message="Hello" isLoading />);

    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("keeps an attachment the per-message budget dropped so it can be sent next", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ChatInput {...defaultProps} message="Hello" onSend={onSend} />);

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: {
        files: [
          createMockFile("old.txt", "o".repeat(200_000)),
          createMockFile("newer.txt", "n".repeat(200_000)),
          createMockFile("newest.txt", "x".repeat(200_000)),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("newest.txt")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(screen.queryByText("newest.txt")).not.toBeInTheDocument());
    expect(screen.queryByText("newer.txt")).not.toBeInTheDocument();
    expect(screen.getByText("old.txt")).toBeInTheDocument();
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend.mock.calls[0][0]).not.toContain('<file name="old.txt">');
  });

  it("disables submit when model has error", () => {
    mockModelContext({ modelStatus: "Error: Something went wrong" });

    render(<ChatInput {...defaultProps} message="Hello" />);

    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("blocks sending on a local model while another conversation is generating", () => {
    window.history.pushState({}, "", "/chat/conversation-a");
    mockModelContext({ currentModel: createMockModel("local") });

    render(<ChatInput {...defaultProps} message="Hello" />);

    beginGeneration("conversation-b");

    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Waiting for the reply in another conversation…"
    );

    endStartedGenerations();

    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });

  it("does not block sending while this conversation is the one generating", () => {
    window.history.pushState({}, "", "/chat/conversation-a");
    mockModelContext({ currentModel: createMockModel("local") });

    render(<ChatInput {...defaultProps} message="Hello" />);

    beginGeneration("conversation-a");

    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });

  it("keeps sending available on an online model while another conversation is generating", () => {
    window.history.pushState({}, "", "/chat/conversation-a");
    mockModelContext({ currentModel: createMockModel("online") });

    render(<ChatInput {...defaultProps} message="Hello" />);

    beginGeneration("conversation-b");

    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
    expect(screen.getByRole("textbox")).not.toHaveAttribute(
      "placeholder",
      "Waiting for the reply in another conversation…"
    );
  });

  it("ignores Enter on a local model while another conversation is generating", () => {
    window.history.pushState({}, "", "/chat/conversation-a");
    mockModelContext({ currentModel: createMockModel("local") });
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(<ChatInput {...defaultProps} message="Hello" onSend={onSend} />);

    beginGeneration("conversation-b");
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

    expect(onSend).not.toHaveBeenCalled();
  });
});
