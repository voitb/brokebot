export interface ProgressInfo {
  status: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

export interface TranscribeOptions {
  chunk_length_s?: number;
  stride_length_s?: number;
  task?: string;
  language?: string;
}

export interface TranscribeResult {
  text?: string;
}

export type WorkerMessage =
  | {
      type: "transcribe";
      requestId: number;
      audioData: Float32Array;
      options: TranscribeOptions;
    }
  | { type: "dispose" };

export type WorkerResponse =
  | { type: "status"; status: string; device?: "webgpu" | "wasm" }
  | { type: "progress"; data: ProgressInfo }
  | { type: "result"; requestId: number; data: TranscribeResult }
  | { type: "error"; requestId: number; error: string }
  | { type: "disposed" };
