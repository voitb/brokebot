import { pipeline, env } from "@huggingface/transformers";
import type {
  AutomaticSpeechRecognitionPipeline,
  ProgressInfo as TransformersProgressInfo,
} from "@huggingface/transformers";
import type { WorkerMessage, WorkerResponse } from "./types";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

const MODEL_ID = "onnx-community/whisper-base";

let transcriberPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;
let device: "webgpu" | "wasm" = "webgpu";

function postResponse(response: WorkerResponse): void {
  self.postMessage(response);
}

async function checkWebGPUSupport(): Promise<boolean> {
  if (!navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

async function loadTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  const hasWebGPU = await checkWebGPUSupport();
  device = hasWebGPU ? "webgpu" : "wasm";

  postResponse({ type: "status", status: "loading", device });

  const transcriber = await pipeline("automatic-speech-recognition", MODEL_ID, {
    device,
    dtype: device === "webgpu" ? "fp32" : "q8",
    progress_callback: (progress: TransformersProgressInfo) => {
      postResponse({ type: "progress", data: progress });
    },
  });

  return transcriber;
}

function getTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  transcriberPromise ??= loadTranscriber().catch((error: unknown) => {
    transcriberPromise = null;
    throw error;
  });
  return transcriberPromise;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  if (type === "transcribe") {
    const { requestId, audioData, options } = event.data;
    try {
      const recognizer = await getTranscriber();
      postResponse({ type: "status", status: "transcribing", device });
      const output = await recognizer(audioData, options);
      const text = Array.isArray(output) ? output[0]?.text : output.text;
      postResponse({ type: "result", requestId, data: { text } });
    } catch (error) {
      postResponse({ type: "error", requestId, error: String(error) });
    }
  }

  if (type === "dispose") {
    const pendingTranscriber = transcriberPromise;
    transcriberPromise = null;
    const loadedTranscriber = await pendingTranscriber?.catch(() => null);
    await loadedTranscriber?.dispose();
    postResponse({ type: "disposed" });
  }
};
