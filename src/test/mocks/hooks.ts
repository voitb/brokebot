import { vi } from "vitest";
import type { Conversation, UserConfig } from "../../lib/db";
import { createMockUserConfig, createMockConversation } from "./factories";

/**
 * Options for creating a useUserConfig mock
 */
export interface MockUserConfigHookOptions {
  config?: Partial<UserConfig> | null;
  updateConfig?: ReturnType<typeof vi.fn>;
  resetConfig?: ReturnType<typeof vi.fn>;
  clearAllData?: ReturnType<typeof vi.fn>;
  exportConversations?: ReturnType<typeof vi.fn>;
  importConversations?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a useUserConfig hook mock return value
 *
 * @example
 * const mockUpdateConfig = vi.fn();
 * vi.mock("@/hooks/useUserConfig", () => ({
 *   useUserConfig: () => createMockUserConfigHook({ updateConfig: mockUpdateConfig }),
 * }));
 */
export function createMockUserConfigHook(options: MockUserConfigHookOptions = {}) {
  return {
    config: options.config !== undefined ? options.config : createMockUserConfig(),
    updateConfig: options.updateConfig ?? vi.fn().mockResolvedValue(undefined),
    resetConfig: options.resetConfig ?? vi.fn().mockResolvedValue(undefined),
    clearAllData: options.clearAllData ?? vi.fn().mockResolvedValue(undefined),
    exportConversations: options.exportConversations ?? vi.fn().mockResolvedValue(undefined),
    importConversations: options.importConversations ?? vi.fn().mockResolvedValue(1),
  };
}

/**
 * Options for creating a useConversations mock
 */
export interface MockConversationsHookOptions {
  conversations?: Conversation[];
  folders?: unknown[];
  createConversation?: ReturnType<typeof vi.fn>;
  createEmptyConversation?: ReturnType<typeof vi.fn>;
  addMessage?: ReturnType<typeof vi.fn>;
  updateMessage?: ReturnType<typeof vi.fn>;
  deleteConversation?: ReturnType<typeof vi.fn>;
  togglePinConversation?: ReturnType<typeof vi.fn>;
  updateConversationTitle?: ReturnType<typeof vi.fn>;
  moveConversationToFolder?: ReturnType<typeof vi.fn>;
  createFolder?: ReturnType<typeof vi.fn>;
  deleteFolder?: ReturnType<typeof vi.fn>;
  updateFolderName?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a useConversations hook mock return value
 *
 * @example
 * const mockCreateEmptyConversation = vi.fn().mockResolvedValue("new-id");
 * vi.mock("@/hooks/useConversations", () => ({
 *   useConversations: () => createMockConversationsHook({
 *     createEmptyConversation: mockCreateEmptyConversation,
 *   }),
 * }));
 */
export function createMockConversationsHook(options: MockConversationsHookOptions = {}) {
  return {
    conversations: options.conversations ?? [],
    folders: options.folders ?? [],
    createConversation: options.createConversation ?? vi.fn().mockResolvedValue("new-id"),
    createEmptyConversation: options.createEmptyConversation ?? vi.fn().mockResolvedValue("new-id"),
    addMessage: options.addMessage ?? vi.fn().mockResolvedValue("message-id"),
    updateMessage: options.updateMessage ?? vi.fn().mockResolvedValue(undefined),
    deleteConversation: options.deleteConversation ?? vi.fn().mockResolvedValue(undefined),
    togglePinConversation: options.togglePinConversation ?? vi.fn().mockResolvedValue(undefined),
    updateConversationTitle: options.updateConversationTitle ?? vi.fn().mockResolvedValue(undefined),
    moveConversationToFolder: options.moveConversationToFolder ?? vi.fn().mockResolvedValue(undefined),
    createFolder: options.createFolder ?? vi.fn().mockResolvedValue("folder-id"),
    deleteFolder: options.deleteFolder ?? vi.fn().mockResolvedValue(undefined),
    updateFolderName: options.updateFolderName ?? vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Options for creating a useConversation mock (single conversation)
 */
export interface MockConversationHookOptions {
  conversation?: Conversation | null;
  messages?: unknown[];
}

/**
 * Creates a useConversation hook mock return value (for single conversation)
 *
 * @example
 * vi.mock("@/hooks/useConversations", () => ({
 *   useConversation: () => createMockConversationHook({
 *     conversation: createMockConversation({ title: "Test" }),
 *   }),
 * }));
 */
export function createMockConversationHook(options: MockConversationHookOptions = {}) {
  const conversation = options.conversation !== undefined
    ? options.conversation
    : createMockConversation();
  return {
    conversation,
    messages: options.messages ?? conversation?.messages ?? [],
  };
}

/**
 * Creates a useConversationId hook mock
 * Returns a simple function that returns the provided ID
 *
 * @example
 * vi.mock("@/hooks/useConversationId", () => ({
 *   useConversationId: () => "test-conversation-id",
 * }));
 */
export function createMockConversationIdHook(id: string | undefined = "test-conversation-id") {
  return id;
}
