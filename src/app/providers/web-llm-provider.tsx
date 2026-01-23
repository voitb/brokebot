import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { toast } from "sonner";

import { loadModelCatalog, type ModelInfo } from "@/features/chat/lib/webllm";

export { type ModelInfo };

interface EngineState {
  engine: WebWorkerMLCEngine | null;
  isLoading: boolean;
  progress: number;
  status: string;
  selectedModel: ModelInfo | null;
  availableModels: ModelInfo[];
  isLoadingModels: boolean;
  setSelectedModel: (model: ModelInfo) => void;
  loadModel: (modelId: string) => Promise<void>;
  loadAvailableModels: () => Promise<ModelInfo[]>;
}

export const WebLLMContext = createContext<EngineState | undefined>(undefined);

interface WebLLMProviderProps {
  children: ReactNode;
}

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedModel, setSelectedModelState] = useState<ModelInfo | null>(null);

  const [engineState, setEngineState] = useState<{
    engine: WebWorkerMLCEngine | null;
    isLoading: boolean;
    progress: number;
    status: string;
  }>({
    engine: null,
    isLoading: false,
    progress: 0,
    status: "Ready",
  });

  // Load available models lazily when needed
  const ensureModelsLoaded = async (): Promise<ModelInfo[]> => {
    if (availableModels.length > 0) {
      return availableModels;
    }

    setIsLoadingModels(true);
    try {
      const models = await loadModelCatalog();
      setAvailableModels(models);
      return models;
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadModel = async (modelId: string) => {
    try {
      if (engineState.engine) {
        await engineState.engine.unload();
      }

      setEngineState((prev) => ({
        ...prev,
        isLoading: true,
        progress: 0,
        status: "Loading WebLLM...",
        engine: null,
      }));

      // Dynamic import: WebLLM (5.5MB) only loads when user selects a local model
      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");

      setEngineState((prev) => ({
        ...prev,
        status: "Loading model...",
      }));

      const newEngine = await CreateWebWorkerMLCEngine(
        new Worker(
          new URL("@/features/chat/lib/webllm/worker.ts", import.meta.url),
          { type: "module" }
        ),
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

  const setSelectedModel = async (model: ModelInfo) => {
    setSelectedModelState(model);
    await loadModel(model.id);
  };

  // Check if user had a local model selected previously
  useEffect(() => {
    const initFromStorage = async () => {
      const stored = localStorage.getItem("unifiedModel");
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored);
        if (parsed?.type === "local" && parsed.localModel?.id) {
          // User previously had a local model - load it
          const models = await ensureModelsLoaded();
          const found = models.find((m) => m.id === parsed.localModel.id);
          if (found) {
            setSelectedModelState(found);
            await loadModel(found.id);
          }
        }
      } catch {
        // Invalid JSON in localStorage, ignore
      }
    };

    initFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount; functions are stable
  }, []);

  const contextValue: EngineState = {
    ...engineState,
    selectedModel,
    availableModels,
    isLoadingModels,
    setSelectedModel,
    loadModel,
    loadAvailableModels: ensureModelsLoaded,
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
