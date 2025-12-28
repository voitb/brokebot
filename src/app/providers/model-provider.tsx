import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
  useEffect,
} from "react";
import { useWebLLM, type ModelInfo } from "./web-llm-provider";
import {
  createOpenRouterClient,
  type OpenRouterClient,
  type OpenRouterModel,
  type OpenRouterMessage,
  type StreamResponse,
} from "@/lib/openrouter";
import { useUserConfig } from "@/shared/hooks/use-user-config";
import { useModels } from "@/features/chat/hooks/use-models";

export type ModelType = "local" | "online";

export interface UnifiedModel {
  id: string;
  name: string;
  type: ModelType;
  description: string;
  localModel?: ModelInfo;
  onlineModel?: OpenRouterModel;
  client?: OpenRouterClient;
}

interface ModelProviderState {
  currentModel: UnifiedModel | null;
  isOnlineMode: boolean;
  isModelLoading: boolean;
  isModelSwitching: boolean;
  modelStatus: string;
  availableOnlineModels: OpenRouterModel[];
  isLoadingAvailableModels: boolean;
  availableModelsError: Error | null;
  setCurrentModel: (model: UnifiedModel) => void;
  sendMessage: (messages: OpenRouterMessage[]) => Promise<string>;
  streamMessage: (
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ) => AsyncGenerator<StreamResponse, void, unknown>;
  interruptGeneration: () => void;
  resetChat: () => Promise<void>;
}

const ModelContext = createContext<ModelProviderState | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
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

  useEffect(() => {
    // Initialize model from localStorage on mount
    const storedModel = localStorage.getItem("unifiedModel");
    if (storedModel) {
      try {
        const parsed = JSON.parse(storedModel) as UnifiedModel;
        if (parsed.type === "online" && parsed.onlineModel && config) {
          // For online models, we need to recreate the client with OpenRouter key only
          setCurrentModelState(
            createOnlineModel(parsed.onlineModel, config.openrouterApiKey)
          );
          return;
        }
      } catch {
        // Fallback to local if JSON is malformed
      }
    }

    // Default to WebLLM model if nothing stored or if it's a local model
    if (webLLM.selectedModel) {
      setCurrentModelState(createLocalModel(webLLM.selectedModel));
    }
  }, [webLLM.selectedModel, config]);

  const interruptGeneration = () => {
    if (currentModel?.type === "local" && webLLM.engine) {
      webLLM.engine.interruptGenerate();
    }
  };

  const resetChat = async () => {
    if (currentModel?.type === "local" && webLLM.engine && currentModel.id) {
      await webLLM.engine.reload(currentModel.id);
    }
  };

  const setCurrentModel = (model: UnifiedModel) => {
    startTransition(() => {
      setCurrentModelState(model);
      localStorage.setItem("unifiedModel", JSON.stringify(model));

      if (model.type === "local" && model.localModel) {
        webLLM.setSelectedModel(model.localModel);
      }
    });
  };

  const sendMessage = async (messages: OpenRouterMessage[]): Promise<string> => {
    if (!currentModel) {
      throw new Error("No model selected");
    }

    if (currentModel.type === "local") {
      if (!webLLM.engine) {
        throw new Error("WebLLM engine not ready");
      }

      const response = await webLLM.engine.chat.completions.create({
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
      });

      return response.choices[0]?.message?.content || "";
    } else {
      if (!currentModel.client) {
        throw new Error("OpenRouter client not configured");
      }

      return await currentModel.client.sendMessage(currentModel.id, messages);
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
        currentModel.id,
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
    sendMessage,
    streamMessage,
    interruptGeneration,
    resetChat,
  };

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelProviderState => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};

// Utility functions to create unified models
export const createLocalModel = (localModel: ModelInfo): UnifiedModel => ({
  id: localModel.id,
  name: localModel.name,
  type: "local",
  description: localModel.description,
  localModel,
});

export const createOnlineModel = (
  onlineModel: OpenRouterModel,
  apiKey?: string
): UnifiedModel => ({
  id: onlineModel.id,
  name: onlineModel.name,
  type: "online",
  description: onlineModel.description,
  onlineModel,
  client: apiKey ? createOpenRouterClient(apiKey) : undefined,
});
