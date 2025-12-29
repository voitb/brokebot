import { vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import type { Conversation, Message, Folder, Document, UserConfig } from "@/lib/db";
import type { OpenRouterModel } from "@/features/chat/lib/openrouter";

export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: uuidv4(),
    role: "user",
    content: "Test message",
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: uuidv4(),
    title: "Test Conversation",
    messages: [],
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockFolder(overrides: Partial<Folder> = {}): Folder {
  return {
    id: uuidv4(),
    name: "Test Folder",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    filename: "test.txt",
    content: "Test content",
    createdAt: new Date(),
    fileType: "txt",
    ...overrides,
  };
}

export function createMockUserConfig(overrides: Partial<UserConfig> = {}): UserConfig {
  return {
    id: "user_config",
    username: "TestUser",
    selectedModelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    autoLoadModel: false,
    theme: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockModel(type: "local" | "online" = "online") {
  if (type === "local") {
    return {
      id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      name: "Llama 3.2 1B",
      type: "local" as const,
      description: "Fast and efficient local model",
    };
  }
  return {
    id: "openai/gpt-4",
    name: "GPT-4",
    type: "online" as const,
    description: "OpenAI GPT-4 model",
  };
}

export function createMockOpenRouterModel(overrides: {
  id: string;
  name: string;
  isFree: boolean;
}) {
  return {
    ...overrides,
    description: "A test model",
    provider: "test-provider",
    category: "general",
    contextLength: 4096,
    pricing: { prompt: "0.0001", completion: "0.0002" },
  };
}

export function createMockLocalModel() {
  return {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B",
    size: "1B",
    description: "Fast and efficient model for quick responses",
    ramRequirement: "2GB",
    downloadSize: "~750MB",
    performance: "Fast",
    category: "light" as const,
    modelType: "LLM" as const,
    specialization: "general",
  };
}

export interface MockWebLLMContextOverrides {
  engine?: unknown;
  isLoading?: boolean;
  progress?: number;
  status?: string;
  selectedModel?: ReturnType<typeof createMockLocalModel>;
  availableModels?: ReturnType<typeof createMockLocalModel>[];
  setSelectedModel?: ReturnType<typeof vi.fn>;
  loadModel?: ReturnType<typeof vi.fn>;
}

export function createMockWebLLMContext(overrides: MockWebLLMContextOverrides = {}) {
  const mockModel = createMockLocalModel();
  return {
    engine: overrides.engine ?? null,
    isLoading: overrides.isLoading ?? false,
    progress: overrides.progress ?? 1,
    status: overrides.status ?? "Ready",
    selectedModel: overrides.selectedModel ?? mockModel,
    availableModels: overrides.availableModels ?? [mockModel],
    setSelectedModel: overrides.setSelectedModel ?? vi.fn(),
    loadModel: overrides.loadModel ?? vi.fn().mockResolvedValue(undefined),
  };
}

export interface MockModelContextOverrides {
  currentModel?: { id: string; name: string; type: "local" | "online"; description: string } | null;
  isOnlineMode?: boolean;
  isModelLoading?: boolean;
  isModelSwitching?: boolean;
  modelStatus?: string;
  availableOnlineModels?: OpenRouterModel[];
  isLoadingAvailableModels?: boolean;
  availableModelsError?: Error | null;
  setCurrentModel?: ReturnType<typeof vi.fn>;
  sendMessage?: ReturnType<typeof vi.fn>;
  streamMessage?: () => AsyncGenerator<{ content: string; isComplete: boolean }, void, unknown>;
  interruptGeneration?: ReturnType<typeof vi.fn>;
  resetChat?: ReturnType<typeof vi.fn>;
}

export function createMockModelContext(overrides: MockModelContextOverrides = {}) {
  return {
    currentModel: overrides.currentModel !== undefined ? overrides.currentModel : {
      id: "test-model",
      name: "Test Model",
      type: "online" as const,
      description: "A test model for unit tests",
    },
    isOnlineMode: overrides.isOnlineMode ?? true,
    isModelLoading: overrides.isModelLoading ?? false,
    isModelSwitching: overrides.isModelSwitching ?? false,
    modelStatus: overrides.modelStatus ?? "Ready",
    availableOnlineModels: overrides.availableOnlineModels ?? ([] as OpenRouterModel[]),
    isLoadingAvailableModels: overrides.isLoadingAvailableModels ?? false,
    availableModelsError: overrides.availableModelsError ?? null,
    setCurrentModel: overrides.setCurrentModel ?? vi.fn(),
    sendMessage: overrides.sendMessage ?? vi.fn().mockResolvedValue("Test response"),
    streamMessage: overrides.streamMessage ?? async function* () {
      yield { content: "Test", isComplete: true };
    },
    interruptGeneration: overrides.interruptGeneration ?? vi.fn(),
    resetChat: overrides.resetChat ?? vi.fn().mockResolvedValue(undefined),
  };
}

export async function* createMockStream<T>(chunks: T[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}
