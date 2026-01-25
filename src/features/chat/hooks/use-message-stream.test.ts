import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessageStream, type StreamResult } from "./use-message-stream";
import { createMockStream } from "@/testing/mocks/factories";

const mockStreamMessage = vi.fn();
const mockInterruptGeneration = vi.fn();
const mockResetChat = vi.fn();

vi.mock("@/app/providers/model-provider", () => ({
  useModel: () => ({
    streamMessage: mockStreamMessage,
    interruptGeneration: mockInterruptGeneration,
    resetChat: mockResetChat,
  }),
}));

describe("useMessageStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("streams content and returns final result", async () => {
    mockStreamMessage.mockReturnValue(
      createMockStream([
        { content: "Hello", isComplete: false },
        { content: "Hello world!", isComplete: true },
      ])
    );

    const { result } = renderHook(() => useMessageStream());
    const onChunk = vi.fn();

    let streamResult: StreamResult | null = null;
    await act(async () => {
      streamResult = await result.current.streamResponse(
        [{ role: "user", content: "Hi" }],
        onChunk
      );
    });

    expect(streamResult).toEqual({
      content: "Hello world!",
      wasAborted: false,
    });
    expect(onChunk).toHaveBeenCalledWith("Hello world!");
    expect(result.current.isGenerating).toBe(false);
  });

  it("returns error with partial content on stream failure", async () => {
    mockStreamMessage.mockReturnValue(
      createMockStream([
        { content: "Partial", isComplete: false },
        { content: "", isComplete: true, error: "Network error" },
      ])
    );

    const { result } = renderHook(() => useMessageStream());

    let streamResult: StreamResult | null = null;
    await act(async () => {
      streamResult = await result.current.streamResponse(
        [{ role: "user", content: "Hi" }],
        vi.fn()
      );
    });

    expect(streamResult!.error?.message).toBe("Network error");
    expect(streamResult!.content).toBe("Partial");
    expect(result.current.isGenerating).toBe(false);
  });
});
