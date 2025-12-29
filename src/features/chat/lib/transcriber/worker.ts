import { pipeline, env } from "@huggingface/transformers";
import type { AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";
import type { WorkerMessage, WorkerResponse } from "./types";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
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

async function getTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  if (!transcriber) {
    const hasWebGPU = await checkWebGPUSupport();
    device = hasWebGPU ? "webgpu" : "wasm";

    postResponse({ type: "status", status: "loading", device });

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-base",
      {
        device,
        dtype: "fp32",
        progress_callback: (progress: unknown) => {
          // Library callback type is complex, cast to our type
          self.postMessage({ type: "progress", data: progress });
        },
      }
    );
  }
  return transcriber;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  if (type === "transcribe") {
    const { audioData, options } = event.data;
    try {
      const recognizer = await getTranscriber();
      postResponse({ type: "status", status: "transcribing", device });
      const result = await recognizer(audioData, options);
      // Library result type is complex, cast to our type
      self.postMessage({ type: "result", data: result });
    } catch (error) {
      postResponse({ type: "error", error: String(error) });
    }
  }

  if (type === "dispose") {
    if (transcriber) {
      await transcriber.dispose();
      transcriber = null;
    }
    postResponse({ type: "disposed" });
  }
};
