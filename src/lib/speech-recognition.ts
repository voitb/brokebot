import {
  pipeline,
  env,
  type AutomaticSpeechRecognitionPipeline,
  type PipelineType,
} from "@xenova/transformers";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

interface ProgressInfo {
  status: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

export class SpeechRecognitionService {
  private static task: PipelineType = "automatic-speech-recognition";
  private static model = "Xenova/whisper-small";
  private static instance: AutomaticSpeechRecognitionPipeline | null = null;
  private static loadingPromise: Promise<AutomaticSpeechRecognitionPipeline> | null =
    null;

  static async getInstance(
    progress_callback?: (progress: ProgressInfo) => void
  ): Promise<AutomaticSpeechRecognitionPipeline> {
    if (this.instance) {
      return this.instance;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = pipeline(this.task, this.model, {
      progress_callback,
    }) as Promise<AutomaticSpeechRecognitionPipeline>;

    try {
      this.instance = await this.loadingPromise;
      return this.instance;
    } finally {
      this.loadingPromise = null;
    }
  }

  static async dispose(): Promise<void> {
    if (this.instance) {
      await this.instance.dispose();
      this.instance = null;
    }
  }
} 