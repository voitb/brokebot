import {
  createContext,
  useContext,
  useState,
  useTransition,
  useEffect,
  type ReactNode,
} from "react";
import { useWebLLM, type ModelInfo } from "./web-llm-provider";
import {
  createOpenRouterClient,
  type OpenRouterClient,
  type OpenRouterModel,
  type OpenRouterMessage,
  type StreamResponse,
} from "@/features/chat/api/openrouter";
import { useUserConfig } from "@/hooks/use-user-config";
import { useModels } from "@/features/chat/hooks/use-models";
import { UnifiedModelSchema } from "@/lib/schemas/model-schema";

export type LocalModel = {
  type: "local";
  localModel: ModelInfo;
};

export type OnlineModel = {
  type: "online";
  onlineModel: OpenRouterModel;
  client?: OpenRouterClient;
};

export type UnifiedModel = LocalModel | OnlineModel;

export interface ModelProviderState {
  currentModel: UnifiedModel | null;
  isOnlineMode: boolean;
  isModelLoading: boolean;
  isModelSwitching: boolean;
  modelStatus: string;
  availableOnlineModels: OpenRouterModel[];
  isLoadingAvailableModels: boolean;
  availableModelsError: Error | null;
  setCurrentModel: (model: UnifiedModel) => void;
  streamMessage: (
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ) => AsyncGenerator<StreamResponse, void, unknown>;
  interruptGeneration: () => void;
  resetChat: () => Promise<void>;
}

export const ModelContext = createContext<ModelProviderState | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const webLLM = useWebLLM();
  const { config } = useUserConfig();
  const {
    models: availableOnlineModels,
    isLoading: isLoadingAvailableModels,
    error: availableModelsError
  } = useModels();
  const [currentModel, setCurrentModelState] = useState<UnifiedModel | null>(
    null
  );
  const [isModelSwitching, startTransition] = useTransition();

  const apiKey = config?.openrouterApiKey;

  // Mount-only: hydrate from localStorage
  useEffect(() => {
    const storedModel = localStorage.getItem("unifiedModel");
    if (!storedModel) return;

    try {
      const jsonData = JSON.parse(storedModel);
      const parsed = UnifiedModelSchema.safeParse(jsonData);

      if (parsed.success && parsed.data.type === "online" && apiKey) {
        setCurrentModelState(
          createOnlineModel(parsed.data.onlineModel, apiKey)
        );
      } else if (!parsed.success) {
        localStorage.removeItem("unifiedModel");
      }
    } catch {
      localStorage.removeItem("unifiedModel");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount with initial apiKey
  }, []);

  // Sync local model selection from WebLLM
  useEffect(() => {
    if (webLLM.selectedModel && currentModel?.type !== "online") {
      setCurrentModelState(createLocalModel(webLLM.selectedModel));
    }
  }, [webLLM.selectedModel]); // eslint-disable-line react-hooks/exhaustive-deps -- Only react to selectedModel changes

  const interruptGeneration = () => {
    if (currentModel?.type === "local" && webLLM.engine) {
      webLLM.engine.interruptGenerate();
    }
  };

  const resetChat = async () => {
    if (currentModel?.type === "local" && webLLM.engine) {
      await webLLM.engine.reload(currentModel.localModel.id);
    }
  };

  const setCurrentModel = (model: UnifiedModel) => {
    startTransition(() => {
      setCurrentModelState(model);
      localStorage.setItem("unifiedModel", JSON.stringify(model));

      if (model.type === "local") {
        webLLM.setSelectedModel(model.localModel);
      }
    });
  };

  async function* streamMessage(
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ): AsyncGenerator<StreamResponse, void, unknown> {
    if (!currentModel) {
      yield { content: "", isComplete: true, error: "No model selected" };
      return;
    }

    if (signal?.aborted) {
      yield { content: "", isComplete: true, error: "stopped" };
      return;
    }

    if (currentModel.type === "local") {
      if (!webLLM.engine) {
        yield { content: "", isComplete: true, error: "WebLLM engine not ready" };
        return;
      }

      try {
        const stream = await webLLM.engine.chat.completions.create({
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
        });

        let fullContent = "";

        for await (const chunk of stream) {
          if (signal?.aborted) {
            break;
          }
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            onProgress?.(fullContent);
            yield { content: fullContent, isComplete: false };
          }
        }

        if (signal?.aborted) {
          yield { content: fullContent, isComplete: true, error: "stopped" };
        } else {
          yield { content: fullContent, isComplete: true };
        }
      } catch (error) {
        yield {
          content: "",
          isComplete: true,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    } else {
      if (!currentModel.client) {
        yield { content: "", isComplete: true, error: "OpenRouter client not configured" };
        return;
      }

      yield* currentModel.client.streamCompletion(
        currentModel.onlineModel.id,
        messages,
        { onProgress, signal }
      );
    }
  }

  const isModelLoading = currentModel?.type === "local" && webLLM.isLoading;
  const modelStatus =
    currentModel?.type === "local"
      ? webLLM.status
      : currentModel
      ? "Ready"
      : "Initializing...";

  const contextValue: ModelProviderState = {
    currentModel,
    isOnlineMode: currentModel?.type === "online",
    isModelLoading,
    isModelSwitching,
    modelStatus,
    availableOnlineModels,
    isLoadingAvailableModels,
    availableModelsError,
    setCurrentModel,
    streamMessage,
    interruptGeneration,
    resetChat,
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = (): ModelProviderState => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};

export const createLocalModel = (localModel: ModelInfo): LocalModel => ({
  type: "local",
  localModel,
});

export const createOnlineModel = (
  onlineModel: OpenRouterModel,
  apiKey?: string
): OnlineModel => ({
  type: "online",
  onlineModel,
  client: apiKey ? createOpenRouterClient(apiKey) : undefined,
});
