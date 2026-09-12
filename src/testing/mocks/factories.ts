import { vi } from "vitest";

import type { Conversation, Message, Folder, Document, UserConfig } from "@/lib/db";
import type { OpenRouterModel } from "@/features/chat/api/openrouter";
import type { UnifiedModel } from "@/app/providers/model-provider";

export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content: "Test message",
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: crypto.randomUUID(),
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
    id: crypto.randomUUID(),
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
    theme: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockModel(type: "local" | "online" = "online"): UnifiedModel {
  if (type === "local") {
    return {
      type: "local" as const,
      localModel: createMockLocalModel(),
    };
  }
  return {
    type: "online" as const,
    onlineModel: createMockOpenRouterModel({
      id: "openai/gpt-4",
      name: "GPT-4",
      isFree: false,
    }),
  };
}

export function createMockOpenRouterModel(overrides: Partial<OpenRouterModel> & {
  id: string;
  name: string;
  isFree: boolean;
}): OpenRouterModel {
  return {
    description: "A test model",
    provider: "test-provider",
    category: "general",
    contextLength: 4096,
    pricing: { prompt: "0.0001", completion: "0.0002" },
    ...overrides,
  };
}

export function createMockLocalModel() {
  return {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B",
    size: "1B",
    description: "Fast and efficient model for quick responses",
    ramRequirement: "2GB",
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
  selectedModel?: ReturnType<typeof createMockLocalModel> | null;
  availableModels?: ReturnType<typeof createMockLocalModel>[];
  isLoadingModels?: boolean;
  setSelectedModel?: ReturnType<typeof vi.fn>;
  loadModel?: ReturnType<typeof vi.fn>;
  loadAvailableModels?: ReturnType<typeof vi.fn>;
}

export function createMockWebLLMContext(overrides: MockWebLLMContextOverrides = {}) {
  const mockModel = createMockLocalModel();
  return {
    engine: overrides.engine ?? null,
    isLoading: overrides.isLoading ?? false,
    progress: overrides.progress ?? 1,
    status: overrides.status ?? "Ready",
    selectedModel: overrides.selectedModel !== undefined ? overrides.selectedModel : mockModel,
    availableModels: overrides.availableModels ?? [mockModel],
    isLoadingModels: overrides.isLoadingModels ?? false,
    setSelectedModel: overrides.setSelectedModel ?? vi.fn(),
    loadModel: overrides.loadModel ?? vi.fn().mockResolvedValue(undefined),
    loadAvailableModels: overrides.loadAvailableModels ?? vi.fn().mockResolvedValue([mockModel]),
  };
}

export interface MockModelContextOverrides {
  currentModel?: UnifiedModel | null;
  isOnlineMode?: boolean;
  isModelLoading?: boolean;
  isModelSwitching?: boolean;
  modelStatus?: string;
  setCurrentModel?: ReturnType<typeof vi.fn>;
  streamMessage?: () => AsyncGenerator<{ content: string; isComplete: boolean }, void, unknown>;
  interruptGeneration?: ReturnType<typeof vi.fn>;
}

export function createMockModelContext(overrides: MockModelContextOverrides = {}) {
  return {
    currentModel: overrides.currentModel !== undefined ? overrides.currentModel : createMockModel("online"),
    isOnlineMode: overrides.isOnlineMode ?? true,
    isModelLoading: overrides.isModelLoading ?? false,
    isModelSwitching: overrides.isModelSwitching ?? false,
    modelStatus: overrides.modelStatus ?? "Ready",
    setCurrentModel: overrides.setCurrentModel ?? vi.fn(),
    streamMessage: overrides.streamMessage ?? async function* () {
      yield { content: "Test", isComplete: true };
    },
    interruptGeneration: overrides.interruptGeneration ?? vi.fn(),
  };
}

export async function* createMockStream<T>(chunks: T[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}
