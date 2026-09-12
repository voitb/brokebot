import type {
  ProgressInfo,
  TranscribeOptions,
  TranscribeResult,
  WorkerMessage,
  WorkerResponse,
} from "./types";

export type { ProgressInfo, TranscribeOptions, TranscribeResult };

type StatusCallback = (status: string, device?: string) => void;
type ProgressCallback = (info: ProgressInfo) => void;

let worker: Worker | null = null;

const IDLE_TIMEOUT_MS = 60_000;

let nextRequestId = 0;

interface PendingRequest {
  cancel: () => void;
  fail: (error: Error) => void;
}

const pendingRequests = new Map<number, PendingRequest>();

function failAllPending(): void {
  for (const pending of pendingRequests.values()) {
    pending.fail(new Error("Transcription worker failed."));
  }
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onerror = failAllPending;
    worker.onmessageerror = failAllPending;
  }
  return worker;
}

async function decodeAudioBlob(audioBlob: Blob): Promise<Float32Array> {
  const audioContext = new AudioContext({ sampleRate: 16000 });
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer.getChannelData(0);
  } finally {
    await audioContext.close();
  }
}

export async function transcribe(
  audioBlob: Blob,
  options: TranscribeOptions,
  callbacks?: {
    onStatus?: StatusCallback;
    onProgress?: ProgressCallback;
  }
): Promise<TranscribeResult> {
  const audioData = await decodeAudioBlob(audioBlob);
  const requestId = nextRequestId++;
  const currentWorker = getWorker();

  return new Promise((resolve, reject) => {
    const listenerController = new AbortController();

    let idleTimeoutId: ReturnType<typeof setTimeout>;

    const settle = () => {
      clearTimeout(idleTimeoutId);
      listenerController.abort();
      pendingRequests.delete(requestId);
    };

    const armIdleTimeout = () => {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        settle();
        reject(new Error("Transcription timed out."));
      }, IDLE_TIMEOUT_MS);
    };

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case "status":
          armIdleTimeout();
          callbacks?.onStatus?.(response.status, response.device);
          break;
        case "progress":
          armIdleTimeout();
          callbacks?.onProgress?.(response.data);
          break;
        case "result":
          if (response.requestId !== requestId) return;
          settle();
          resolve(response.data);
          break;
        case "error":
          if (response.requestId !== requestId) return;
          settle();
          reject(new Error(response.error));
          break;
      }
    };

    const failRequest = (error: Error) => {
      settle();
      reject(error);
    };

    currentWorker.addEventListener("message", handleMessage, {
      signal: listenerController.signal,
    });

    pendingRequests.set(requestId, {
      cancel: () => failRequest(new Error("Transcription was cancelled.")),
      fail: failRequest,
    });

    armIdleTimeout();

    const message: WorkerMessage = {
      type: "transcribe",
      requestId,
      audioData,
      options,
    };
    currentWorker.postMessage(message);
  });
}

export async function disposeTranscriber(): Promise<void> {
  if (!worker) return;

  const currentWorker = worker;
  worker = null; // Clear immediately to prevent concurrent calls

  for (const pending of pendingRequests.values()) {
    pending.cancel();
  }
  pendingRequests.clear();

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      currentWorker.terminate();
      resolve();
    }, 10_000);

    const handler = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === "disposed") {
        clearTimeout(timeoutId);
        currentWorker.removeEventListener("message", handler);
        currentWorker.terminate();
        resolve();
      }
    };

    currentWorker.addEventListener("message", handler);
    const message: WorkerMessage = { type: "dispose" };
    currentWorker.postMessage(message);
  });
}
