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

// Available models
export const AVAILABLE_MODELS = [
  {
    id: "Llama-3.1-8B-Instruct-q4f32_1-MLC",
    name: "Llama-3.1-8B-Instruct",
    size: "8B",
    description: "Meta's latest Llama model, great for conversations",
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi-3-mini-4k-instruct",
    size: "3.8B",
    description: "Microsoft's efficient model for reasoning",
  },
  {
    id: "gemma-2b-it-q4f32_1-MLC",
    name: "Gemma-2B-it",
    size: "2B",
    description: "Google's lightweight model",
  },
  {
    id: "Qwen2-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2-1.5B-Instruct",
    size: "1.5B",
    description: "Alibaba's fast and efficient model",
  },
  {
    id: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
    name: "Mistral-7B-Instruct-v0.3",
    size: "7B",
    description: "Mistral AI's high-quality model",
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
