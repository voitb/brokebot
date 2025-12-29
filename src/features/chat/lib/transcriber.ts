import {
  pipeline,
  env,
  type AutomaticSpeechRecognitionPipeline,
} from "@xenova/transformers";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

export interface ProgressInfo {
  status: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

let transcriber: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

export function getTranscriber(onProgress?: (info: ProgressInfo) => void) {
  if (!transcriber) {
    transcriber = pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { progress_callback: onProgress }
    );
  }
  return transcriber;
}

export async function disposeTranscriber() {
  if (transcriber) {
    const t = await transcriber;
    await t.dispose();
    transcriber = null;
  }
}
