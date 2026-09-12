import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessageStream, type StreamResult } from "./use-message-stream";
import { createMockStream } from "@/testing/mocks/factories";

const mockStreamMessage = vi.fn();
const mockInterruptGeneration = vi.fn();

vi.mock("@/app/providers/model-provider", () => ({
  useModel: () => ({
    streamMessage: mockStreamMessage,
    interruptGeneration: mockInterruptGeneration,
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
        "conversation-1",
        [{ role: "user", content: "Hi" }],
        onChunk
      );
    });

    expect(streamResult!.content).toBe("Hello world!");
    expect(streamResult!.isTruncated).toBe(false);
    expect(onChunk).toHaveBeenCalledWith("Hello world!");
  });

  it("reports a reply the model cut off at the token cap", async () => {
    mockStreamMessage.mockReturnValue(
      createMockStream([
        { content: "Cut", isComplete: false },
        { content: "Cut off", isComplete: true, isTruncated: true },
      ])
    );

    const { result } = renderHook(() => useMessageStream());

    const streamResult = await act(() =>
      result.current.streamResponse("conversation-4", [{ role: "user", content: "Hi" }], vi.fn())
    );

    expect(streamResult.isTruncated).toBe(true);
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
        "conversation-2",
        [{ role: "user", content: "Hi" }],
        vi.fn()
      );
    });

    expect(streamResult!.error?.message).toBe("Network error");
    expect(streamResult!.content).toBe("Partial");
  });

  it("stops delivering chunks once generation is stopped mid-stream", async () => {
    const { result } = renderHook(() => useMessageStream());
    const onChunk = vi.fn();
    mockStreamMessage.mockImplementation(async function* () {
      yield { content: "Partial", isComplete: false };
      result.current.stopGeneration("conversation-3");
      yield { content: "Never delivered", isComplete: true };
    });
    const streamResult = await act(() =>
      result.current.streamResponse("conversation-3", [{ role: "user", content: "Hi" }], onChunk)
    );
    expect(streamResult.content).toBe("Partial");
    expect(onChunk).toHaveBeenCalledExactlyOnceWith("Partial");
    expect(mockInterruptGeneration).toHaveBeenCalledOnce();
  });

  it("ends the stream without aborting when the model reports stopped", async () => {
    mockStreamMessage.mockReturnValue(
      createMockStream([
        { content: "Half", isComplete: false },
        { content: "", isComplete: true, error: "stopped" },
      ])
    );
    const { result } = renderHook(() => useMessageStream());
    const onChunk = vi.fn();
    const streamResult = await act(() =>
      result.current.streamResponse("conversation-5", [{ role: "user", content: "Hi" }], onChunk)
    );
    expect(streamResult.content).toBe("Half");
    expect(onChunk).toHaveBeenCalledExactlyOnceWith("Half");
    expect(mockInterruptGeneration).not.toHaveBeenCalled();
  });

  it("finishes a detached stream after the hook unmounts", async () => {
    const { result, unmount } = renderHook(() => useMessageStream());
    const onChunk = vi.fn();
    mockStreamMessage.mockImplementation(async function* () {
      yield { content: "Partial", isComplete: false };
      unmount();
      yield { content: "Partial and the rest", isComplete: true };
    });
    const streamResult = await act(() =>
      result.current.streamResponse("conversation-6", [{ role: "user", content: "Hi" }], onChunk)
    );
    expect(streamResult.content).toBe("Partial and the rest");
    expect(onChunk).toHaveBeenLastCalledWith("Partial and the rest");
  });

  it("stops a stream that another hook instance started for the same conversation", async () => {
    const { result: streamer } = renderHook(() => useMessageStream());
    const { result: stopper } = renderHook(() => useMessageStream());
    const onChunk = vi.fn();
    mockStreamMessage.mockImplementation(async function* () {
      yield { content: "Partial", isComplete: false };
      stopper.current.stopGeneration("conversation-7");
      yield { content: "Never delivered", isComplete: true };
    });

    const streamResult = await act(() =>
      streamer.current.streamResponse("conversation-7", [{ role: "user", content: "Hi" }], onChunk)
    );

    expect(streamResult.content).toBe("Partial");
    expect(mockInterruptGeneration).toHaveBeenCalledOnce();
  });

  it("does nothing when stop is requested with no stream in flight", () => {
    const { result } = renderHook(() => useMessageStream());
    act(() => result.current.stopGeneration("conversation-8"));
    expect(mockInterruptGeneration).not.toHaveBeenCalled();
  });
});
