import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TranscribeOptions, WorkerMessage, WorkerResponse, ProgressInfo } from "./types";

type MessageHandler = (event: MessageEvent<WorkerResponse>) => void;

let mockWorker: {
  postMessage: ReturnType<typeof vi.fn<(message: WorkerMessage) => void>>;
  addEventListener: ReturnType<typeof vi.fn<(type: string, handler: MessageHandler) => void>>;
  removeEventListener: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  onerror: ((event: Event) => void) | null;
  onmessageerror: ((event: Event) => void) | null;
};
let mockAudioContext: {
  sampleRate: number;
  decodeAudioData: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};
let originalWorker: typeof Worker;
let originalAudioContext: typeof AudioContext;

function createMockBlob(): Blob {
  const arrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
  const blob = new Blob([arrayBuffer]);
  Object.defineProperty(blob, "arrayBuffer", {
    value: vi.fn().mockResolvedValue(arrayBuffer),
  });
  return blob;
}

async function waitForEventListener(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function simulateResponse(response: WorkerResponse): void {
  const messageEvent = new MessageEvent<WorkerResponse>("message", { data: response });
  for (const [type, handler] of mockWorker.addEventListener.mock.calls) {
    if (type === "message") handler(messageEvent);
  }
}

function lastRequestId(): number {
  const lastTranscribeCall = mockWorker.postMessage.mock.calls.findLast(
    ([message]) => message.type === "transcribe"
  );
  if (!lastTranscribeCall || lastTranscribeCall[0].type !== "transcribe") {
    throw new Error("no transcribe message was posted");
  }
  return lastTranscribeCall[0].requestId;
}

function setupMocks(): void {
  mockWorker = {
    postMessage: vi.fn<(message: WorkerMessage) => void>(),
    addEventListener: vi.fn<(type: string, handler: MessageHandler) => void>(),
    removeEventListener: vi.fn(),
    terminate: vi.fn(),
    onerror: null,
    onmessageerror: null,
  };

  mockAudioContext = {
    sampleRate: 16000,
    decodeAudioData: vi.fn().mockResolvedValue({
      getChannelData: vi.fn().mockReturnValue(new Float32Array([0.1, 0.2])),
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };

  originalWorker = globalThis.Worker;
  originalAudioContext = globalThis.AudioContext;

  globalThis.Worker = function () {
    return mockWorker;
  } as unknown as typeof Worker;

  globalThis.AudioContext = function () {
    return mockAudioContext;
  } as unknown as typeof AudioContext;
}

function restoreMocks(): void {
  globalThis.Worker = originalWorker;
  globalThis.AudioContext = originalAudioContext;
}

describe("transcribe", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    setupMocks();
  });

  afterEach(restoreMocks);

  it("returns transcription result on success", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "Hello world" } });

    expect(await promise).toEqual({ text: "Hello world" });
  });

  it("passes options to worker", async () => {
    const { transcribe } = await import("./transcribe");
    const options: TranscribeOptions = { chunk_length_s: 30, language: "en", task: "transcribe" };

    const promise = transcribe(createMockBlob(), options);
    await waitForEventListener();
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });
    await promise;

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "transcribe",
      requestId: expect.any(Number),
      audioData: expect.any(Float32Array),
      options,
    });
  });

  it("invokes onStatus callback with status updates", async () => {
    const { transcribe } = await import("./transcribe");
    const onStatus = vi.fn();

    const promise = transcribe(createMockBlob(), {}, { onStatus });
    await waitForEventListener();
    simulateResponse({ type: "status", status: "loading", device: "webgpu" });
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });
    await promise;

    expect(onStatus).toHaveBeenCalledWith("loading", "webgpu");
  });

  it("invokes onProgress callback with progress info", async () => {
    const { transcribe } = await import("./transcribe");
    const onProgress = vi.fn();
    const progressInfo: ProgressInfo = { status: "loading", progress: 50, loaded: 500, total: 1000 };

    const promise = transcribe(createMockBlob(), {}, { onProgress });
    await waitForEventListener();
    simulateResponse({ type: "progress", data: progressInfo });
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });
    await promise;

    expect(onProgress).toHaveBeenCalledWith(progressInfo);
  });

  it("handles missing callbacks gracefully", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "status", status: "loading" });
    simulateResponse({ type: "progress", data: { status: "loading" } });
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });

    expect(await promise).toEqual({ text: "test" });
  });

  it("rejects with error message from worker", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "error", requestId: lastRequestId(), error: "Transcription failed" });

    await expect(promise).rejects.toThrow("Transcription failed");
  });

  it("ignores a result meant for a different request", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    const requestId = lastRequestId();
    simulateResponse({ type: "result", requestId: requestId + 1, data: { text: "not mine" } });
    simulateResponse({ type: "result", requestId, data: { text: "mine" } });

    expect(await promise).toEqual({ text: "mine" });
  });

  it("rejects when the worker raises an error event", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    mockWorker.onerror?.(new Event("error"));

    await expect(promise).rejects.toThrow("Transcription worker failed.");
  });

  it("rejects every in-flight transcription when the worker raises an error event", async () => {
    const { transcribe } = await import("./transcribe");
    const first = transcribe(createMockBlob(), {});
    await waitForEventListener();
    const second = transcribe(createMockBlob(), {});
    await waitForEventListener();

    mockWorker.onerror?.(new Event("error"));

    await expect(first).rejects.toThrow("Transcription worker failed.");
    await expect(second).rejects.toThrow("Transcription worker failed.");
  });

  it("does not extend the stall timeout when a reply for another request arrives", async () => {
    vi.useFakeTimers();
    try {
      const { transcribe } = await import("./transcribe");
      const promise = transcribe(createMockBlob(), {});
      await waitForEventListener();
      const rejection = expect(promise).rejects.toThrow("Transcription timed out.");

      await vi.advanceTimersByTimeAsync(50_000);
      simulateResponse({
        type: "result",
        requestId: lastRequestId() + 1,
        data: { text: "not mine" },
      });
      await vi.advanceTimersByTimeAsync(10_000);

      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects when the worker goes silent", async () => {
    vi.useFakeTimers();
    try {
      const { transcribe } = await import("./transcribe");
      const promise = transcribe(createMockBlob(), {});
      await waitForEventListener();
      const rejection = expect(promise).rejects.toThrow("Transcription timed out.");
      await vi.advanceTimersByTimeAsync(60_000);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects an in-flight transcription when the transcriber is disposed", async () => {
    const { transcribe, disposeTranscriber } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    const rejection = expect(promise).rejects.toThrow("Transcription was cancelled.");
    const disposePromise = disposeTranscriber();
    simulateResponse({ type: "disposed" });
    await disposePromise;

    await rejection;
  });

  it("closes the AudioContext when decoding fails", async () => {
    const { transcribe } = await import("./transcribe");
    mockAudioContext.decodeAudioData.mockRejectedValue(new Error("bad audio"));

    await expect(transcribe(createMockBlob(), {})).rejects.toThrow("bad audio");

    expect(mockAudioContext.close).toHaveBeenCalled();
  });
});

describe("disposeTranscriber", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    setupMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    restoreMocks();
  });

  it("returns immediately when no worker exists", async () => {
    const { disposeTranscriber } = await import("./transcribe");
    await disposeTranscriber();
    expect(mockWorker.terminate).not.toHaveBeenCalled();
  });

  it("terminates worker after dispose response", async () => {
    const { transcribe, disposeTranscriber } = await import("./transcribe");
    const transcribePromise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });
    await transcribePromise;

    const disposePromise = disposeTranscriber();
    simulateResponse({ type: "disposed" });
    await disposePromise;

    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it("terminates worker after timeout if no response", async () => {
    const { transcribe, disposeTranscriber } = await import("./transcribe");
    const transcribePromise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "result", requestId: lastRequestId(), data: { text: "test" } });
    await transcribePromise;

    const disposePromise = disposeTranscriber();
    await vi.advanceTimersByTimeAsync(10_000);
    await disposePromise;

    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
