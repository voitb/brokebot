import type { AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";

declare module "@huggingface/transformers" {
  export function pipeline(
    task: "automatic-speech-recognition",
    model: string,
    options?: {
      device?: "webgpu" | "wasm" | "cpu";
      dtype?: string;
      progress_callback?: (progress: unknown) => void;
    }
  ): Promise<AutomaticSpeechRecognitionPipeline>;
}
