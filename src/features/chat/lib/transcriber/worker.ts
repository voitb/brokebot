/// <reference path="./transformers.d.ts" />
import { pipeline, env } from "@huggingface/transformers";
import type { AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let device: "webgpu" | "wasm" = "webgpu";

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

    self.postMessage({ type: "status", status: "loading", device });

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-base",
      {
        device,
        dtype: "fp32",
        progress_callback: (progress: unknown) => {
          self.postMessage({ type: "progress", data: progress });
        },
      }
    );
  }
  return transcriber;
}

self.onmessage = async (event: MessageEvent) => {
  const { type, audioData, options } = event.data;

  if (type === "transcribe") {
    try {
      const recognizer = await getTranscriber();
      self.postMessage({ type: "status", status: "transcribing", device });
      const result = await recognizer(audioData, options);
      self.postMessage({ type: "result", data: result });
    } catch (error) {
      self.postMessage({ type: "error", error: String(error) });
    }
  }

  if (type === "dispose") {
    if (transcriber) {
      await transcriber.dispose();
      transcriber = null;
    }
    self.postMessage({ type: "disposed" });
  }
};
