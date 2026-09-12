import {
  createContext,
  useContext,
  useState,
  useTransition,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useWebLLM, type ModelInfo } from "./web-llm-provider";
import {
  createOpenRouterClient,
  type OpenRouterClient,
  type OpenRouterModel,
  type OpenRouterMessage,
  type StreamResponse,
} from "@/features/chat/api/openrouter";
import { useUserConfig } from "@/hooks/use-user-config";
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
  setCurrentModel: (model: UnifiedModel) => void;
  streamMessage: (
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ) => AsyncGenerator<StreamResponse, void, unknown>;
  interruptGeneration: () => void;
}

export const ModelContext = createContext<ModelProviderState | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const webLLM = useWebLLM();
  const { config } = useUserConfig();
  const apiKey = config?.openrouterApiKey;
  const [currentModel, setCurrentModelState] = useState<UnifiedModel | null>(
    null
  );
  const [isModelSwitching, startTransition] = useTransition();

  // Hydrate online model from localStorage when apiKey is available
  useEffect(() => {
    if (!apiKey) {
      if (currentModel?.type === "online") {
        setCurrentModelState(null);
        localStorage.removeItem("unifiedModel");
        webLLM
          .loadDefaultModel()
          .catch(() => toast.error("Failed to load the local model."));
      }
      return;
    }

    if (currentModel?.type === "online") {
      setCurrentModelState(createOnlineModel(currentModel.onlineModel, apiKey));
      return;
    }

    const storedModel = localStorage.getItem("unifiedModel");
    if (!storedModel) return;

    try {
      const jsonData = JSON.parse(storedModel);
      const parsed = UnifiedModelSchema.safeParse(jsonData);

      if (parsed.success && parsed.data.type === "online") {
        setCurrentModelState(
          createOnlineModel(parsed.data.onlineModel, apiKey)
        );
      } else if (!parsed.success) {
        localStorage.removeItem("unifiedModel");
      }
    } catch {
      localStorage.removeItem("unifiedModel");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- React to key changes only; depending on currentModel would re-run on every model change
  }, [apiKey]);

  // Sync local model selection from WebLLM
  useEffect(() => {
    if (webLLM.selectedModel && currentModel?.type !== "online") {
      setCurrentModelState(createLocalModel(webLLM.selectedModel));
    }
  }, [webLLM.selectedModel, currentModel?.type]);

  const interruptGeneration = () => {
    if (currentModel?.type === "local" && webLLM.engine) {
      webLLM.engine.interruptGenerate();
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

    if (model.type === "online") {
      webLLM
        .unloadEngine()
        .catch(() => toast.error("Failed to unload the local model."));
    }
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
  const onlineModelStatus = currentModel ? "Ready" : "Initializing...";
  const modelStatus = currentModel?.type === "local" ? webLLM.status : onlineModelStatus;

  const contextValue: ModelProviderState = {
    currentModel,
    isOnlineMode: currentModel?.type === "online",
    isModelLoading,
    isModelSwitching,
    modelStatus,
    setCurrentModel,
    streamMessage,
    interruptGeneration,
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
