import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TranscribeOptions, WorkerResponse, ProgressInfo } from "./types";

let mockWorker: {
  postMessage: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
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
  const handler = mockWorker.addEventListener.mock.calls.findLast(
    (c: unknown[]) => c[0] === "message"
  )?.[1] as ((event: MessageEvent<WorkerResponse>) => void) | undefined;
  handler?.({ data: response } as MessageEvent<WorkerResponse>);
}

function setupMocks(): void {
  mockWorker = {
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    terminate: vi.fn(),
  };

  const mockAudioContext = {
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
    simulateResponse({ type: "result", data: { text: "Hello world" } });

    expect(await promise).toEqual({ text: "Hello world" });
  });

  it("passes options to worker", async () => {
    const { transcribe } = await import("./transcribe");
    const options: TranscribeOptions = { chunk_length_s: 30, language: "en", task: "transcribe" };

    const promise = transcribe(createMockBlob(), options);
    await waitForEventListener();
    simulateResponse({ type: "result", data: { text: "test" } });
    await promise;

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "transcribe",
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
    simulateResponse({ type: "result", data: { text: "test" } });
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
    simulateResponse({ type: "result", data: { text: "test" } });
    await promise;

    expect(onProgress).toHaveBeenCalledWith(progressInfo);
  });

  it("handles missing callbacks gracefully", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "status", status: "loading" });
    simulateResponse({ type: "progress", data: { status: "loading" } });
    simulateResponse({ type: "result", data: { text: "test" } });

    expect(await promise).toEqual({ text: "test" });
  });

  it("rejects with error message from worker", async () => {
    const { transcribe } = await import("./transcribe");
    const promise = transcribe(createMockBlob(), {});

    await waitForEventListener();
    simulateResponse({ type: "error", error: "Transcription failed" });

    await expect(promise).rejects.toThrow("Transcription failed");
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
    simulateResponse({ type: "result", data: { text: "test" } });
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
    simulateResponse({ type: "result", data: { text: "test" } });
    await transcribePromise;

    const disposePromise = disposeTranscriber();
    await vi.advanceTimersByTimeAsync(10_000);
    await disposePromise;

    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
