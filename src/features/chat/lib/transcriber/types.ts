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
