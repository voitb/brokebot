import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { toast } from "sonner";

import { loadModelCatalog, type ModelInfo } from "@/features/chat/api/webllm";
import { UnifiedModelSchema } from "@/lib/schemas/model-schema";

export { type ModelInfo };

interface EngineState {
  engine: WebWorkerMLCEngine | null;
  isLoading: boolean;
  progress: number;
  status: string;
  selectedModel: ModelInfo | null;
  availableModels: ModelInfo[];
  isLoadingModels: boolean;
  setSelectedModel: (model: ModelInfo) => Promise<void>;
  loadModel: (modelId: string) => Promise<void>;
  loadAvailableModels: () => Promise<ModelInfo[]>;
  loadDefaultModel: () => Promise<void>;
  unloadEngine: () => Promise<void>;
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

  const loadControllerRef = useRef<AbortController | null>(null);
  const initControllerRef = useRef<AbortController | null>(null);

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
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;

    try {
      if (engineState.engine) {
        await engineState.engine.unload();
      }
      if (controller.signal.aborted) return;

      setEngineState((prev) => ({
        ...prev,
        isLoading: true,
        progress: 0,
        status: "Loading WebLLM...",
        engine: null,
      }));

      // Dynamic import: WebLLM (5.5MB) only loads when user selects a local model
      const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
      if (controller.signal.aborted) return;

      setEngineState((prev) => ({
        ...prev,
        status: "Loading model...",
      }));

      const worker = new Worker(
        new URL("@/features/chat/api/webllm/worker.ts", import.meta.url),
        { type: "module" }
      );
      const newEngine = await CreateWebWorkerMLCEngine(
        worker,
        modelId,
        {
          initProgressCallback: (report) => {
            if (controller.signal.aborted) return;
            setEngineState((prev) => ({
              ...prev,
              progress: report.progress,
              status: report.text,
            }));
          },
        }
      );
      if (controller.signal.aborted) {
        await newEngine.unload();
        worker.terminate();
        return;
      }

      setEngineState({
        engine: newEngine,
        isLoading: false,
        progress: 1,
        status: "Ready",
      });
    } catch (error) {
      if (controller.signal.aborted) return;

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
      } else {
        toast.error("Failed to load the local model.", {
          description: error instanceof Error ? error.message : String(error),
        });
      }

      setEngineState((prev) => ({
        ...prev,
        isLoading: false,
        status: "Initialization error",
      }));
    }
  };

  const unloadEngine = async () => {
    loadControllerRef.current?.abort();
    initControllerRef.current?.abort();
    const { engine } = engineState;
    setSelectedModelState(null);
    setEngineState({
      engine: null,
      isLoading: false,
      progress: 0,
      status: "Ready",
    });
    await engine?.unload();
  };

  const setSelectedModel = async (model: ModelInfo) => {
    setSelectedModelState(model);
    await loadModel(model.id);
  };

  const loadDefaultModel = async () => {
    const controller = new AbortController();
    initControllerRef.current = controller;

    const models = await ensureModelsLoaded();
    if (controller.signal.aborted) return;

    const defaultModel =
      models.find((m) => m.id === "Llama-3.2-3B-Instruct-q4f16_1-MLC") ??
      models.find((m) => m.category === "light" && m.modelType === "LLM");
    if (!defaultModel) return;

    setSelectedModelState(defaultModel);
    if (controller.signal.aborted) return;
    await loadModel(defaultModel.id);
  };

  // Restore saved local model, or auto-load default on first visit
  useEffect(() => {
    const controller = new AbortController();
    initControllerRef.current = controller;

    const initFromStorage = async () => {
      try {
        const stored = localStorage.getItem("unifiedModel");

        if (!stored) {
          // No saved model — auto-load default local model
          await loadDefaultModel();
          return;
        }

        let storedModel: unknown;
        try {
          storedModel = JSON.parse(stored);
        } catch {
          return;
        }

        const result = UnifiedModelSchema.safeParse(storedModel);
        if (!result.success) return;

        const parsed = result.data;
        if (parsed.type === "local") {
          const models = await ensureModelsLoaded();
          if (controller.signal.aborted) return;
          const found = models.find((m) => m.id === parsed.localModel.id);
          if (found) {
            setSelectedModelState(found);
            if (controller.signal.aborted) return;
            await loadModel(found.id);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        toast.error("Failed to initialize local models.", {
          description: error instanceof Error ? error.message : String(error),
        });
      }
    };

    initFromStorage();
    return () => {
      initControllerRef.current?.abort();
      loadControllerRef.current?.abort();
    };
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
    loadDefaultModel,
    unloadEngine,
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
