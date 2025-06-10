import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";

import WebLLMWorker from "../worker.ts?worker";
import { COMPLETE_AI_RULES } from "../lib/aiRules";

// Extended list of available models with hardware requirements
export const AVAILABLE_MODELS = [
  // Light models (1-2GB RAM)
  {
    id: "Qwen2-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2-0.5B-Instruct",
    size: "0.5B",
    description: "Ultra-lightweight model for basic tasks",
    ramRequirement: "1-2GB RAM",
    downloadSize: "~400MB",
    performance: "Fast",
    category: "light",
  },
  {
    id: "Qwen2-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2-1.5B-Instruct",
    size: "1.5B",
    description: "Alibaba's efficient model for general tasks",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1GB",
    performance: "Fast",
    category: "light",
  },
  {
    id: "gemma-2b-it-q4f32_1-MLC",
    name: "Gemma-2B-it",
    size: "2B",
    description: "Google's lightweight model",
    ramRequirement: "2-4GB RAM",
    downloadSize: "~1.5GB",
    performance: "Fast",
    category: "light",
  },
  {
    id: "SmolLM-1.7B-Instruct-q4f16_1-MLC",
    name: "SmolLM-1.7B-Instruct",
    size: "1.7B",
    description: "HuggingFace's compact model for basic conversations",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1GB",
    performance: "Fast",
    category: "light",
  },
  
  // Medium models (3-5GB RAM)
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi-3-mini-4k-instruct",
    size: "3.8B",
    description: "Microsoft's efficient model for reasoning",
    ramRequirement: "3-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "Balanced",
    category: "medium",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi-3.5-mini-instruct",
    size: "3.8B",
    description: "Microsoft's latest Phi model with improved capabilities",
    ramRequirement: "3-5GB RAM",
    downloadSize: "~2.5GB",
    performance: "Balanced",
    category: "medium",
  },
  
  // Large models (6-10GB RAM)
  {
    id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    name: "Mistral-7B-Instruct-v0.3",
    size: "7B",
    description: "Mistral AI's high-quality model",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "High Quality",
    category: "large",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama-3.2-3B-Instruct",
    size: "3B",
    description: "Meta's latest compact Llama model",
    ramRequirement: "4-6GB RAM",
    downloadSize: "~2GB",
    performance: "High Quality",
    category: "medium",
  },
  {
    id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-7B-Instruct",
    size: "7B",
    description: "Alibaba's advanced model with strong reasoning",
    ramRequirement: "6-8GB RAM",
    downloadSize: "~4GB",
    performance: "High Quality",
    category: "large",
  },
  
  // Heavy models (8-16GB RAM) - Very resource intensive
  {
    id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
    name: "Llama-3.1-8B-Instruct",
    size: "8B",
    description: "Meta's flagship model with excellent performance",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Excellent",
    category: "heavy",
  },
  {
    id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC",
    name: "Hermes-2-Pro-Llama-3-8B",
    size: "8B",
    description: "Enhanced Llama-3 with improved instruction following",
    ramRequirement: "8-12GB RAM",
    downloadSize: "~5GB",
    performance: "Excellent",
    category: "heavy",
  },
  {
    id: "DeepSeek-R1-Distill-Qwen-1.5B-q4f32_1-MLC",
    name: "DeepSeek-R1-Distill-Qwen-1.5B",
    size: "1.5B",
    description: "DeepSeek's reasoning-focused distilled model",
    ramRequirement: "2-3GB RAM",
    downloadSize: "~1GB",
    performance: "Reasoning",
    category: "light",
  },
] as const;

export type ModelInfo = (typeof AVAILABLE_MODELS)[number];

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
    const stored = localStorage.getItem("selectedModel");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = AVAILABLE_MODELS.find((m) => m.id === parsed.id);
        return found || AVAILABLE_MODELS[0];
      } catch {
        return AVAILABLE_MODELS[0];
      }
    }
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
      setEngineState((prev) => ({
        ...prev,
        isLoading: false,
        status: "Initialization error",
      }));
    }
  }, []);

  const setSelectedModel = useCallback(
    (model: ModelInfo) => {
      setSelectedModelState(model);
      localStorage.setItem("selectedModel", JSON.stringify(model));
      // Load the new model
      loadModel(model.id);
    },
    [loadModel]
  );

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
