import {
  pipeline,
  env,
  type AutomaticSpeechRecognitionPipeline,
  type PipelineType,
} from "@xenova/transformers";

// Environment setup to use remote models and browser cache for performance
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

/**
 * Manages the singleton instance of the speech recognition pipeline.
 * This ensures the model is loaded only once and reused across the application,
 * providing a centralized point for model management.
 */
export class SpeechRecognitionService {
  private static task: PipelineType = "automatic-speech-recognition";
  private static model = "Xenova/whisper-small"; // Using the 'small' model for better accuracy
  private static instance: AutomaticSpeechRecognitionPipeline | null = null;
  private static loadingPromise: Promise<AutomaticSpeechRecognitionPipeline> | null =
    null;

  /**
   * Gets the singleton instance of the speech recognition pipeline.
   * If the instance doesn't exist, it initializes the pipeline.
   * This prevents concurrent loading and ensures only one instance is created.
   * @param progress_callback - Optional callback to track model loading progress.
   */
  static async getInstance(
    progress_callback?: (progress: any) => void
  ): Promise<AutomaticSpeechRecognitionPipeline> {
    if (this.instance) {
      return this.instance;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    console.log("Initializing new speech recognition pipeline instance.");
    this.loadingPromise = pipeline(this.task, this.model, {
      progress_callback,
    }) as Promise<AutomaticSpeechRecognitionPipeline>;

    try {
      this.instance = await this.loadingPromise;
      console.log("Pipeline instance created successfully.");
      return this.instance;
    } finally {
      this.loadingPromise = null; // Clear the promise after completion
    }
  }
  
  /**
   * Disposes of the pipeline instance to free up resources.
   * Note: This will require the model to be reloaded on next use.
   */
  static async dispose(): Promise<void> {
    if (this.instance) {
      console.log("Disposing speech recognition pipeline instance.");
      await this.instance.dispose();
      this.instance = null;
    }
  }
} 