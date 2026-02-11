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

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

async function decodeAudioBlob(audioBlob: Blob): Promise<Float32Array> {
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  await audioContext.close();
  return channelData;
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

  return new Promise((resolve, reject) => {
    const currentWorker = getWorker();

    const handler = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case "status":
          callbacks?.onStatus?.(response.status, response.device);
          break;
        case "progress":
          callbacks?.onProgress?.(response.data);
          break;
        case "result":
          currentWorker.removeEventListener("message", handler);
          resolve(response.data);
          break;
        case "error":
          currentWorker.removeEventListener("message", handler);
          reject(new Error(response.error));
          break;
      }
    };

    currentWorker.addEventListener("message", handler);
    const message: WorkerMessage = { type: "transcribe", audioData, options };
    currentWorker.postMessage(message);
  });
}

export async function disposeTranscriber(): Promise<void> {
  if (!worker) return;

  const currentWorker = worker;
  worker = null; // Clear immediately to prevent concurrent calls

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
