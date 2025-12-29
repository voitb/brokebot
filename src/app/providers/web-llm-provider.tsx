import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { toast } from "sonner";

import WebLLMWorker from "@/worker.ts?worker";
import { createModelCatalog, type ModelInfo } from "@/features/chat/lib/webllm";

export { type ModelInfo };

export const AVAILABLE_MODELS = createModelCatalog();

interface EngineState {
  engine: WebWorkerMLCEngine | null;
  isLoading: boolean;
  progress: number;
  status: string;
  selectedModel: ModelInfo;
  availableModels: typeof AVAILABLE_MODELS;
  setSelectedModel: (model: ModelInfo) => void;
  loadModel: (modelId: string) => Promise<void>;
}

const WebLLMContext = createContext<EngineState | undefined>(undefined);

interface WebLLMProviderProps {
  children: ReactNode;
}

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  const [selectedModel, setSelectedModelState] = useState<ModelInfo>(() => {
    const stored = localStorage.getItem("unifiedModel");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.type === "local" && parsed.localModel?.id) {
          const found = AVAILABLE_MODELS.find(
            (m) => m.id === parsed.localModel.id
          );
          if (found) return found;
        }
      } catch {
        // Ignore malformed JSON
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

  const loadModel = async (modelId: string) => {
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
  };

  const setSelectedModel = (model: ModelInfo) => {
    setSelectedModelState(model);
    loadModel(model.id);
  };

  useEffect(() => {
    loadModel(selectedModel.id);
    // Only run on mount - setSelectedModel handles model changes directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
