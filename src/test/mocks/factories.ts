import { v4 as uuidv4 } from "uuid";
import type { Conversation, Message, Folder, Document, UserConfig } from "../../lib/db";

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
    };
  }
  return {
    id: "openai/gpt-4",
    name: "GPT-4",
    type: "online" as const,
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

export function createMockWebLLMContext() {
  const mockModel = createMockLocalModel();
  return {
    engine: null,
    isLoading: false,
    progress: 1,
    status: "Ready",
    selectedModel: mockModel,
    availableModels: [mockModel],
    setSelectedModel: () => {},
    loadModel: () => Promise.resolve(),
  };
}

export function createMockModelContext() {
  return {
    currentModel: {
      id: "test-model",
      name: "Test Model",
      type: "online" as const,
      description: "A test model for unit tests",
    },
    isOnlineMode: true,
    isModelLoading: false,
    modelStatus: "Ready",
    availableOnlineModels: [],
    isLoadingAvailableModels: false,
    availableModelsError: null,
    setCurrentModel: () => {},
    sendMessage: () => Promise.resolve("Test response"),
    streamMessage: async function* () {
      yield { content: "Test", isComplete: true };
    },
    interruptGeneration: () => {},
    resetChat: () => Promise.resolve(),
  };
}
