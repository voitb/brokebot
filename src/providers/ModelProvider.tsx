import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import { useWebLLM, type ModelInfo } from "./WebLLMProvider";
import {
  OpenRouterClient,
  type OpenRouterModel,
  type OpenRouterMessage,
  type StreamResponse,
  type ApiKeyConfig,
} from "../lib/openrouter";
import { functions } from "../lib/appwriteClient";
import { useUserConfig } from "../hooks/useUserConfig";
import { useModels  } from "@/hooks/api";

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

  useEffect(() => {
    // Initialize model from localStorage on mount
    const storedModel = localStorage.getItem("unifiedModel");
    if (storedModel) {
      try {
        const parsed = JSON.parse(storedModel) as UnifiedModel;
        if (parsed.type === "online" && parsed.onlineModel && config) {
          // For online models, we need to recreate the client with OpenRouter key only
          setCurrentModelState(
            createOnlineModel(parsed.onlineModel, undefined, {
              openrouterApiKey: config.openrouterApiKey,
              // Future keys - commented out for now
              // openaiApiKey: config.openaiApiKey,
              // anthropicApiKey: config.anthropicApiKey,
              // googleApiKey: config.googleApiKey,
            })
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

  const interruptGeneration = useCallback(() => {
    if (currentModel?.type === "local" && webLLM.engine) {
      webLLM.engine.interruptGenerate();
    }
  }, [currentModel, webLLM.engine]);

  const resetChat = useCallback(async () => {
    if (currentModel?.type === "local" && webLLM.engine && currentModel.id) {
      await webLLM.engine.reload(currentModel.id);
    }
  }, [currentModel, webLLM.engine]);

  const setCurrentModel = useCallback(
    (model: UnifiedModel) => {
      setCurrentModelState(model);
      localStorage.setItem("unifiedModel", JSON.stringify(model));

      // If switching to local model, update WebLLM
      if (model.type === "local" && model.localModel) {
        webLLM.setSelectedModel(model.localModel);
      }
    },
    [webLLM]
  );

  const sendMessage = useCallback(
    async (messages: OpenRouterMessage[]): Promise<string> => {
      if (!currentModel) {
        throw new Error("No model selected");
      }

      if (currentModel.type === "local") {
        // Use WebLLM for local models
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
        // Use OpenRouter for online models
        if (!currentModel.client) {
          throw new Error("OpenRouter client not configured");
        }

        return await currentModel.client.sendMessage(currentModel.id, messages);
      }
    },
    [currentModel, webLLM.engine]
  );

  const streamMessage = useCallback(
    async function* (
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
        // Use WebLLM streaming for local models
        if (!webLLM.engine) {
          yield {
            content: "",
            isComplete: true,
            error: "WebLLM engine not ready",
          };
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
              if (onProgress) {
                onProgress(fullContent);
              }
              yield {
                content: fullContent,
                isComplete: false,
              };
            }
          }

          if (signal?.aborted) {
            yield { content: fullContent, isComplete: true, error: "stopped" };
          } else {
            yield {
              content: fullContent,
              isComplete: true,
            };
          }
        } catch (error) {
          yield {
            content: "",
            isComplete: true,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          };
        }
      } else {
        // Use OpenRouter streaming for online models
        if (!currentModel.client) {
          yield {
            content: "",
            isComplete: true,
            error: "OpenRouter client not configured",
          };
          return;
        }

        yield* currentModel.client.streamCompletion(
          currentModel.id,
          messages,
          onProgress,
          signal
        );
      }
    },
    [currentModel, webLLM.engine]
  );

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
  client?: OpenRouterClient,
  keys?: ApiKeyConfig
): UnifiedModel => {
  // If no client provided, create one with Appwrite Functions and OpenRouter key only
  const finalClient =
    client ||
    new OpenRouterClient({
      functions,
      siteUrl: window.location.origin,
      siteName: "Local GPT",
      keys: keys || {
        openrouterApiKey: undefined,
        // Future keys - commented out for now
        // openaiApiKey: undefined,
        // anthropicApiKey: undefined,
        // googleApiKey: undefined,
      },
    });

  return {
    id: onlineModel.id,
    name: onlineModel.name,
    type: "online",
    description: onlineModel.description,
    onlineModel,
    client: finalClient,
  };
};
