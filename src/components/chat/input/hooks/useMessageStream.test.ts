import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessageStream, type StreamResult } from "./useMessageStream";

// Helper to assert stream result is defined after act() completes
function assertStreamResult(result: StreamResult | null): StreamResult {
  if (!result) throw new Error("Stream result not initialized");
  return result;
}

const mockStreamMessage = vi.fn();
const mockInterruptGeneration = vi.fn();
const mockResetChat = vi.fn();

vi.mock("../../../../providers/ModelProvider", () => ({
  useModel: () => ({
    streamMessage: mockStreamMessage,
    interruptGeneration: mockInterruptGeneration,
    resetChat: mockResetChat,
  }),
}));

async function* createMockStream(chunks: Array<{ content: string; isComplete?: boolean; error?: string }>) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

describe("useMessageStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with isGenerating false", () => {
      const { result } = renderHook(() => useMessageStream());

      expect(result.current.isGenerating).toBe(false);
    });

    it("provides streamResponse function", () => {
      const { result } = renderHook(() => useMessageStream());

      expect(typeof result.current.streamResponse).toBe("function");
    });

    it("provides stopGeneration function", () => {
      const { result } = renderHook(() => useMessageStream());

      expect(typeof result.current.stopGeneration).toBe("function");
    });
  });

  describe("streamResponse", () => {
    it("returns content after streaming completes", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Hello", isComplete: false },
        { content: "Hello world", isComplete: true },
      ]));

      const { result } = renderHook(() => useMessageStream());

      const messages = [{ role: "user" as const, content: "Hi" }];
      const onChunk = vi.fn();

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(messages, onChunk);
      });

      expect(assertStreamResult(streamResult).content).toBe("Hello world");
      expect(result.current.isGenerating).toBe(false);
    });

    it("accumulates content from chunks", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Hello", isComplete: false },
        { content: "Hello world", isComplete: false },
        { content: "Hello world!", isComplete: true },
      ]));

      const { result } = renderHook(() => useMessageStream());
      const onChunk = vi.fn();

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          onChunk
        );
      });

      expect(onChunk).toHaveBeenCalledWith("Hello");
      expect(onChunk).toHaveBeenCalledWith("Hello world");
      expect(onChunk).toHaveBeenCalledWith("Hello world!");
      expect(assertStreamResult(streamResult).content).toBe("Hello world!");
    });

    it("returns wasAborted as false for normal completion", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Complete", isComplete: true },
      ]));

      const { result } = renderHook(() => useMessageStream());

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      expect(assertStreamResult(streamResult).wasAborted).toBe(false);
    });

    it("handles errors in stream", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Partial", isComplete: false },
        { content: "", isComplete: true, error: "Network error" },
      ]));

      const { result } = renderHook(() => useMessageStream());

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      const result_ = assertStreamResult(streamResult);
      expect(result_.error).toBeDefined();
      expect(result_.error?.message).toBe("Network error");
    });

    it("handles stopped error gracefully", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Partial", isComplete: false },
        { content: "", isComplete: true, error: "stopped" },
      ]));

      const { result } = renderHook(() => useMessageStream());

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      const result_ = assertStreamResult(streamResult);
      expect(result_.error).toBeUndefined();
      expect(result_.content).toBe("Partial");
    });

    it("handles thrown errors", async () => {
      mockStreamMessage.mockImplementation(async function* () {
        yield { content: "Start", isComplete: false };
        throw new Error("Unexpected error");
      });

      const { result } = renderHook(() => useMessageStream());

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      expect(assertStreamResult(streamResult).error?.message).toBe("Unexpected error");
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe("stopGeneration", () => {
    it("sets isGenerating to false when called", () => {
      const { result } = renderHook(() => useMessageStream());

      act(() => {
        result.current.stopGeneration();
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it("provides stopGeneration function that can be called", () => {
      const { result } = renderHook(() => useMessageStream());

      expect(() => {
        act(() => {
          result.current.stopGeneration();
        });
      }).not.toThrow();
    });
  });

  describe("abort handling", () => {
    it("handles stopped error in stream", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Partial", isComplete: false },
        { content: "", isComplete: true, error: "stopped" },
      ]));

      const { result } = renderHook(() => useMessageStream());
      const onChunk = vi.fn();

      let streamResult: StreamResult | null = null;
      await act(async () => {
        streamResult = await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          onChunk
        );
      });

      const result_ = assertStreamResult(streamResult);
      expect(result_.content).toBe("Partial");
      expect(result_.error).toBeUndefined();
    });

    it("stopGeneration can be called at any time", () => {
      const { result } = renderHook(() => useMessageStream());

      expect(() => {
        act(() => {
          result.current.stopGeneration();
        });
      }).not.toThrow();

      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("resets isGenerating after stream completes", async () => {
      mockStreamMessage.mockReturnValue(createMockStream([
        { content: "Done", isComplete: true },
      ]));

      const { result } = renderHook(() => useMessageStream());

      await act(async () => {
        await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it("resets isGenerating after error", async () => {
      mockStreamMessage.mockImplementation(async function* () {
        throw new Error("Error");
      });

      const { result } = renderHook(() => useMessageStream());

      await act(async () => {
        await result.current.streamResponse(
          [{ role: "user", content: "Hi" }],
          vi.fn()
        );
      });

      expect(result.current.isGenerating).toBe(false);
    });
  });
});
