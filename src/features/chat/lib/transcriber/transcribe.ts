import type { ProgressInfo, TranscribeOptions, TranscribeResult } from "./types";

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
    const w = getWorker();

    const handler = (event: MessageEvent) => {
      const { type, data, error, status, device } = event.data;

      switch (type) {
        case "status":
          callbacks?.onStatus?.(status, device);
          break;
        case "progress":
          callbacks?.onProgress?.(data);
          break;
        case "result":
          w.removeEventListener("message", handler);
          resolve(data);
          break;
        case "error":
          w.removeEventListener("message", handler);
          reject(new Error(error));
          break;
      }
    };

    w.addEventListener("message", handler);
    w.postMessage({ type: "transcribe", audioData, options });
  });
}

export async function disposeTranscriber(): Promise<void> {
  if (worker) {
    const w = worker;
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === "disposed") {
          w.removeEventListener("message", handler);
          w.terminate();
          worker = null;
          resolve();
        }
      };
      w.addEventListener("message", handler);
      w.postMessage({ type: "dispose" });
    });
  }
}
