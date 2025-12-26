import { encryptValue, decryptValue } from "./encryptionService";

export interface ApiKeyConfig {
  openrouterApiKey?: string;
}

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  isFree: boolean;
  contextLength: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface OpenRouterClient {
  streamCompletion: (
    model: string,
    messages: OpenRouterMessage[],
    options?: { onProgress?: (content: string) => void; signal?: AbortSignal }
  ) => AsyncGenerator<StreamResponse, void, unknown>;
  sendMessage: (
    model: string,
    messages: OpenRouterMessage[]
  ) => Promise<string>;
  testConnection: () => Promise<{ success: boolean; error?: string }>;
}

export function getCategoryFromModel(model: {
  id: string;
  name: string;
  description: string;
}): string {
  const modelName = model.name.toLowerCase();
  const modelId = model.id.toLowerCase();
  const modelDesc = model.description.toLowerCase();

  if (modelId.includes("vision") || modelDesc.includes("multimodal"))
    return "multimodal";
  if (modelName.includes("claude") && modelName.includes("sonnet"))
    return "reasoning";
  if (modelName.includes("gpt-4") || modelName.includes("reasoning"))
    return "reasoning";
  if (
    modelName.includes("flash") ||
    modelName.includes("haiku") ||
    modelName.includes("mini")
  )
    return "efficient";
  if (modelId.includes("code") || modelDesc.includes("coding"))
    return "instruction";
  if (modelName.includes("instruct")) return "instruction";

  return "general";
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function validateApiKey(key: string): boolean {
  return key.startsWith("sk-or-") && key.length > 20;
}

export function createOpenRouterClient(apiKey: string): OpenRouterClient {
  function buildHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  function getValidatedKey(): { key: string } | { error: string } {
    if (!apiKey) {
      return {
        error: "OpenRouter API key not found. Please add your API key in Settings.",
      };
    }
    if (!validateApiKey(apiKey)) {
      return { error: "Invalid OpenRouter API key format." };
    }
    return { key: apiKey };
  }

  async function* streamCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options?: { onProgress?: (content: string) => void; signal?: AbortSignal }
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const validation = getValidatedKey();
    if ("error" in validation) {
      yield { content: "", isComplete: true, error: validation.error };
      return;
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ model, messages, stream: true }),
        signal: options?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          `API request failed with status ${response.status}`;
        yield { content: "", isComplete: true, error: errorMessage };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield {
          content: "",
          isComplete: true,
          error: "Failed to get response stream",
        };
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;

            if (delta) {
              accumulatedContent += delta;
              options?.onProgress?.(accumulatedContent);
              yield { content: accumulatedContent, isComplete: false };
            }
          } catch {
            // Malformed JSON chunks are expected in SSE streams
          }
        }
      }

      yield { content: accumulatedContent, isComplete: true };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        yield { content: "", isComplete: true, error: "stopped" };
        return;
      }
      yield {
        content: "",
        isComplete: true,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async function sendMessage(
    model: string,
    messages: OpenRouterMessage[]
  ): Promise<string> {
    const validation = getValidatedKey();
    if ("error" in validation) {
      throw new Error(validation.error);
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ model, messages, stream: false }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async function testConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    const validation = getValidatedKey();
    if ("error" in validation) {
      return { success: false, error: validation.error };
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (response.status === 200) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid API key." };
      }
      return {
        success: false,
        error: `Validation failed with status: ${response.status}`,
      };
    } catch {
      return { success: false, error: "Network error while validating API key." };
    }
  }

  return { streamCompletion, sendMessage, testConnection };
}

export async function getStoredApiKeys(): Promise<ApiKeyConfig> {
  if (typeof window === "undefined") return {};

  try {
    const encryptedKeys = localStorage.getItem("apiKeys");
    if (!encryptedKeys) return {};

    const parsedKeys = JSON.parse(encryptedKeys) as Record<string, string>;
    const decryptedKeys: ApiKeyConfig = {};

    for (const [provider, encryptedKey] of Object.entries(parsedKeys)) {
      if (encryptedKey && typeof encryptedKey === "string") {
        try {
          const decrypted = await decryptValue(encryptedKey);
          if (provider === "openrouterApiKey") {
            decryptedKeys.openrouterApiKey = decrypted;
          }
        } catch {
          console.warn(`Failed to decrypt key for ${provider}`);
        }
      }
    }

    return decryptedKeys;
  } catch {
    console.warn("Failed to parse stored API keys");
    return {};
  }
}

export async function storeApiKeys(
  keys: Partial<ApiKeyConfig>
): Promise<void> {
  if (typeof window === "undefined") return;

  const currentKeys = await getStoredApiKeys();
  const newKeys = { ...currentKeys, ...keys };
  const encryptedKeys: Record<string, string> = {};

  for (const [provider, key] of Object.entries(newKeys)) {
    if (key && typeof key === "string") {
      encryptedKeys[provider] = await encryptValue(key);
    }
  }

  localStorage.setItem("apiKeys", JSON.stringify(encryptedKeys));
}
