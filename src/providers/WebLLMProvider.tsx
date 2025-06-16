import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { toast } from "sonner";

import WebLLMWorker from "../worker.ts?worker";
import { COMPLETE_AI_RULES } from "../lib/aiRules";

// Extended list of all available WebLLM models with hardware requirements
export const AVAILABLE_MODELS = [
  // Ultra Light models (0.5-1GB RAM)
  {
    id: "SmolLM2-135M-Instruct-q0f16-MLC",
    name: "SmolLM2-135M-Instruct",
    size: "135M",
    description: "Ultra-tiny model for basic tasks",
    ramRequirement: "512MB-1GB RAM",
    downloadSize: "~200MB",
    performance: "Basic",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "SmolLM2-360M-Instruct-q4f16_1-MLC",
    name: "SmolLM2-360M-Instruct",
    size: "360M",
    description: "Compact model for simple conversations",
    ramRequirement: "512MB-1GB RAM",
    downloadSize: "~300MB",
    performance: "Basic",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-0.5B-Instruct",
    size: "0.5B",
    description: "Alibaba's ultra-lightweight model",
    ramRequirement: "1GB RAM",
    downloadSize: "~400MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "Qwen3-0.6B-q4f16_1-MLC",
    name: "Qwen3-0.6B",
    size: "0.6B",
    description: "Latest Qwen ultra-light model",
    ramRequirement: "1-2GB RAM",
    downloadSize: "~500MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    name: "TinyLlama-1.1B-Chat",
    size: "1.1B",
    description: "Tiny Llama model for basic chat",
    ramRequirement: "1-2GB RAM",
    downloadSize: "~600MB",
    performance: "Fast",
    category: "light",
    modelType: "LLM",
  },

  // Light models (1-3GB RAM)
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-1.5B-Instruct",
    size: "1.5B",
    description: "Alibaba's efficient model for general tasks",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "Qwen3-1.7B-q4f16_1-MLC",
    name: "Qwen3-1.7B",
    size: "1.7B",
    description: "Latest Qwen light model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.2GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    name: "SmolLM2-1.7B-Instruct",
    size: "1.7B",
    description: "HuggingFace's compact model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.2GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "stablelm-2-zephyr-1_6b-q4f16_1-MLC",
    name: "StableLM-2-Zephyr-1.6B",
    size: "1.6B",
    description: "Stability AI's efficient chat model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.1GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    name: "Gemma-2-2B-it",
    size: "2B",
    description: "Google's latest lightweight model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.5GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },
  {
    id: "gemma-2b-it-q4f16_1-MLC",
    name: "Gemma-2B-it (Original)",
    size: "2B",
    description: "Google's original lightweight model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1.5GB",
    performance: "Good",
    category: "light",
    modelType: "LLM",
  },

  // Medium models (3-6GB RAM)
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama-3.2-3B-Instruct",
    size: "3B",
    description: "Meta's latest compact Llama model",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "Hermes-3-Llama-3.2-3B-q4f16_1-MLC",
    name: "Hermes-3-Llama-3.2-3B",
    size: "3B",
    description: "Enhanced Llama-3.2 with improved instruction following",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-3B-Instruct",
    size: "3B",
    description: "Alibaba's balanced model",
    ramRequirement: "3-4GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi-3-mini-4k-instruct",
    size: "3.8B",
    description: "Microsoft's efficient model for reasoning",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi-3.5-mini-instruct",
    size: "3.8B",
    description: "Microsoft's latest Phi model with improved capabilities",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "Qwen3-4B-q4f16_1-MLC",
    name: "Qwen3-4B",
    size: "4B",
    description: "Latest Qwen medium model",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },
  {
    id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
    name: "RedPajama-INCITE-Chat-3B",
    size: "3B",
    description: "Together's open-source chat model",
    ramRequirement: "4-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "High Quality",
    category: "medium",
    modelType: "LLM",
  },

  // Vision Language Models (VLM)
  {
    id: "Phi-3.5-vision-instruct-q4f16_1-MLC",
    name: "Phi-3.5-Vision-Instruct",
    size: "4.2B",
    description: "Microsoft's vision-language model - can analyze images",
    ramRequirement: "4-6GB RAM",
    downloadSize: "~3GB",
    performance: "Multimodal",
    category: "medium",
    modelType: "VLM",
    supportsImages: true,
  },

  // Large models (6-10GB RAM)
  {
    id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    name: "Mistral-7B-Instruct-v0.3",
    size: "7B",
    description: "Mistral AI's high-quality model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  {
    id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-7B-Instruct",
    size: "7B",
    description: "Alibaba's advanced model with strong reasoning",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  {
    id: "Llama-3-8B-Instruct-q4f16_1-MLC",
    name: "Llama-3-8B-Instruct",
    size: "8B",
    description: "Meta's flagship model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4.5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  {
    id: "Qwen3-8B-q4f16_1-MLC",
    name: "Qwen3-8B",
    size: "8B",
    description: "Latest Qwen large model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4.5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },
  {
    id: "gemma-2-9b-it-q4f16_1-MLC",
    name: "Gemma-2-9B-it",
    size: "9B",
    description: "Google's large model",
    ramRequirement: "7-9GB RAM",
    downloadSize: "~5GB",
    performance: "Excellent",
    category: "large",
    modelType: "LLM",
  },

  // Heavy models (8-16GB RAM) - Very resource intensive
  {
    id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
    name: "Llama-3.1-8B-Instruct",
    size: "8B",
    description: "Meta's latest flagship model with 128k context",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
  },
  {
    id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
    name: "Hermes-2-Pro-Llama-3-8B",
    size: "8B",
    description: "Enhanced Llama-3 with function calling support",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
    supportsFunctions: true,
  },
  {
    id: "Hermes-3-Llama-3.1-8B-q4f16_1-MLC",
    name: "Hermes-3-Llama-3.1-8B",
    size: "8B",
    description: "Latest Hermes with advanced capabilities",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Premium",
    category: "heavy",
    modelType: "LLM",
    supportsFunctions: true,
  },
  {
    id: "DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC",
    name: "DeepSeek-R1-Distill-Qwen-7B",
    size: "7B",
    description: "DeepSeek's reasoning-focused model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Reasoning",
    category: "large",
    modelType: "LLM",
  },
  {
    id: "DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC",
    name: "DeepSeek-R1-Distill-Llama-8B",
    size: "8B",
    description: "DeepSeek's advanced reasoning model",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Reasoning",
    category: "heavy",
    modelType: "LLM",
  },

  // Specialized models
  {
    id: "Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-Coder-7B-Instruct",
    size: "7B",
    description: "Specialized for coding tasks",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Coding",
    category: "large",
    modelType: "LLM",
    specialization: "coding",
  },
  {
    id: "Qwen2.5-Math-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-Math-7B-Instruct",
    size: "7B",
    description: "Specialized for mathematical reasoning",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Math",
    category: "large",
    modelType: "LLM",
    specialization: "math",
  },
  {
    id: "WizardMath-7B-V1.1-q4f16_1-MLC",
    name: "WizardMath-7B-V1.1",
    size: "7B",
    description: "Mathematical problem solving specialist",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "Math",
    category: "large",
    modelType: "LLM",
    specialization: "math",
  },

  // Embedding models
  {
    id: "snowflake-arctic-embed-m-q0f32-MLC-b4",
    name: "Snowflake Arctic Embed M",
    size: "110M",
    description: "Text embedding model for semantic search",
    ramRequirement: "1GB RAM",
    downloadSize: "~400MB",
    performance: "Embeddings",
    category: "light",
    modelType: "embedding",
  },
  {
    id: "snowflake-arctic-embed-s-q0f32-MLC-b4",
    name: "Snowflake Arctic Embed S",
    size: "33M",
    description: "Small text embedding model",
    ramRequirement: "512MB RAM",
    downloadSize: "~200MB",
    performance: "Embeddings",
    category: "light",
    modelType: "embedding",
  },

  // Extreme models (16GB+ RAM)
  {
    id: "Llama-3.1-70B-Instruct-q3f16_1-MLC",
    name: "Llama-3.1-70B-Instruct",
    size: "70B",
    description: "Meta's largest model - requires significant resources",
    ramRequirement: "32GB+ RAM",
    downloadSize: "~40GB",
    performance: "Ultimate",
    category: "extreme",
    modelType: "LLM",
    warning: "Requires high-end hardware",
  },
] as const;

export type ModelInfo = (typeof AVAILABLE_MODELS)[number] & {
  supportsImages?: boolean;
  supportsFunctions?: boolean;
  specialization?: string;
  warning?: string;
};

type EngineState = {
  engine: WebWorkerMLCEngine | null;
  isLoading: boolean;
  progress: number;
  status: string;
  selectedModel: ModelInfo;
  availableModels: typeof AVAILABLE_MODELS;
  setSelectedModel: (model: ModelInfo) => void;
  loadModel: (modelId: string) => Promise<void>;
  systemMessage: string;
};

const WebLLMContext = createContext<EngineState | undefined>(undefined);

type WebLLMProviderProps = {
  children: ReactNode;
};

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  // Load selected model from localStorage
  const [selectedModel, setSelectedModelState] = useState<ModelInfo>(() => {
    const stored = localStorage.getItem("unifiedModel"); // Key used by ModelProvider
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if it's a local model.
        // We don't import UnifiedModel type here to avoid circular dependencies.
        if (parsed && parsed.type === "local" && parsed.localModel?.id) {
          const found = AVAILABLE_MODELS.find(
            (m) => m.id === parsed.localModel.id
          );
          if (found) {
            return found;
          }
        }
      } catch {
        // Fallback to default if JSON is malformed
      }
    }
    // Default to the first model if nothing is stored, or if it's an online model
    return AVAILABLE_MODELS[0];
  });

  const [engineState, setEngineState] = useState<{
    engine: WebWorkerMLCEngine | null;
    isLoading: boolean;
    progress: number;
    status: string;
  }>({
    engine: null,
    isLoading: true,
    progress: 0,
    status: "Initializing...",
  });

  const loadModel = useCallback(async (modelId: string) => {
    try {
      setEngineState((prev) => ({
        ...prev,
        isLoading: true,
        progress: 0,
        status: "Loading model...",
        engine: null,
      }));

      const newEngine = await CreateWebWorkerMLCEngine(
        new WebLLMWorker(),
        modelId,
        {
          initProgressCallback: (report) => {
            setEngineState((prev) => ({
              ...prev,
              progress: report.progress,
              status: report.text,
            }));
          },
        }
      );

      setEngineState({
        engine: newEngine,
        isLoading: false,
        progress: 1,
        status: "Ready",
      });
    } catch (error) {
      console.error("WebLLM engine initialization error:", error);
      if (error instanceof Error && (error.message.includes("WebGPU") || error.message.includes("Web-GPU"))) {
        toast.error(
          "WebGPU is required for local models to run in this browser.",
          {
            description: "Please enable WebGPU in your browser settings and refresh the page. This may require enabling a special flag.",
            action: {
              label: "Learn More",
              onClick: () => window.open("https://developer.chrome.com/docs/web-platform/webgpu", "_blank"),
            },
            duration: 10000,
          }
        );
      }
      setEngineState((prev) => ({
        ...prev,
        isLoading: false,
        status: "Initialization error",
      }));
    }
  }, []);

  const setSelectedModel =  
    (model: ModelInfo) => {
      setSelectedModelState(model);
      // Load the new model
      loadModel(model.id);
    } 
    
    ;

  useEffect(() => {
    loadModel(selectedModel.id);
  }, []);

  const contextValue: EngineState = {
    ...engineState,
    selectedModel,
    availableModels: AVAILABLE_MODELS,
    setSelectedModel,
    loadModel,
    systemMessage: COMPLETE_AI_RULES,
  };

  return (
    <WebLLMContext.Provider value={contextValue}>
      {children}
    </WebLLMContext.Provider>
  );
};

export const useWebLLM = () => {
  const context = useContext(WebLLMContext);
  if (context === undefined) {
    throw new Error("useWebLLM must be used within a WebLLMProvider");
  }
  return context;
};
