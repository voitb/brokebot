import type React from "react";
import { vi } from "vitest";
import type { Conversation, Folder, UserConfig } from "@/lib/db";
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

export interface MockSmartAutoScrollHookOptions {
  scrollAreaRef?: { current: HTMLElement | null };
  showScrollButton?: boolean;
  handleScrollToBottomClick?: () => void;
}

export function createMockSmartAutoScrollHook(options: MockSmartAutoScrollHookOptions = {}) {
  return {
    scrollAreaRef: options.scrollAreaRef ?? { current: null },
    showScrollButton: options.showScrollButton ?? false,
    handleScrollToBottomClick: options.handleScrollToBottomClick ?? vi.fn(),
  };
}

type ItemStyle = "hover:bg-muted/50" | "bg-primary/10 border-primary text-primary font-medium" | "bg-muted/70";

export interface MockConversationItemHookOptions {
  isEditing?: boolean;
  isMenuOpen?: boolean;
  deleteDialogOpen?: boolean;
  isCreateFolderDialogOpen?: boolean;
  isPinned?: boolean;
  isActive?: boolean;
  folders?: Folder[];
  setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateFolderDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleConversationClick?: () => void;
  handlePinToggle?: (e: React.MouseEvent) => Promise<void>;
  handleRename?: (e: React.MouseEvent) => void;
  handleSaveRename?: (newTitle: string) => Promise<void>;
  handleCancelRename?: () => void;
  handleDelete?: (e: React.MouseEvent) => void;
  handleDeleteConfirm?: () => Promise<void>;
  handleMove?: (folderId: string | null) => Promise<void>;
  handleCreateFolderAndMove?: (folderName: string) => Promise<void>;
  getItemStyles?: () => ItemStyle;
}

export function createMockConversationItemHook(options: MockConversationItemHookOptions = {}) {
  return {
    isEditing: options.isEditing ?? false,
    isMenuOpen: options.isMenuOpen ?? false,
    deleteDialogOpen: options.deleteDialogOpen ?? false,
    isCreateFolderDialogOpen: options.isCreateFolderDialogOpen ?? false,
    isPinned: options.isPinned ?? false,
    isActive: options.isActive ?? false,
    folders: options.folders ?? [],
    setIsMenuOpen: options.setIsMenuOpen ?? vi.fn<React.Dispatch<React.SetStateAction<boolean>>>(),
    setDeleteDialogOpen: options.setDeleteDialogOpen ?? vi.fn<React.Dispatch<React.SetStateAction<boolean>>>(),
    setCreateFolderDialogOpen: options.setCreateFolderDialogOpen ?? vi.fn<React.Dispatch<React.SetStateAction<boolean>>>(),
    handleConversationClick: options.handleConversationClick ?? vi.fn<() => void>(),
    handlePinToggle: options.handlePinToggle ?? vi.fn<(e: React.MouseEvent) => Promise<void>>(),
    handleRename: options.handleRename ?? vi.fn<(e: React.MouseEvent) => void>(),
    handleSaveRename: options.handleSaveRename ?? vi.fn<(newTitle: string) => Promise<void>>(),
    handleCancelRename: options.handleCancelRename ?? vi.fn<() => void>(),
    handleDelete: options.handleDelete ?? vi.fn<(e: React.MouseEvent) => void>(),
    handleDeleteConfirm: options.handleDeleteConfirm ?? vi.fn<() => Promise<void>>(),
    handleMove: options.handleMove ?? vi.fn<(folderId: string | null) => Promise<void>>(),
    handleCreateFolderAndMove: options.handleCreateFolderAndMove ?? vi.fn<(folderName: string) => Promise<void>>(),
    getItemStyles: options.getItemStyles ?? vi.fn<() => ItemStyle>().mockReturnValue("hover:bg-muted/50"),
  };
}

export interface MockConversationListHookOptions {
  searchTerm?: string;
  isSearching?: boolean;
  pinnedConversations?: Conversation[];
  foldersWithConversations?: Array<Folder & { conversations: Conversation[] }>;
  unfoldedConversations?: Conversation[];
  setSearchTerm?: (term: string) => void;
  handleNewChat?: (folderId?: string) => Promise<void>;
}

export function createMockConversationListHook(options: MockConversationListHookOptions = {}) {
  return {
    searchTerm: options.searchTerm ?? "",
    isSearching: options.isSearching ?? false,
    pinnedConversations: options.pinnedConversations ?? [],
    foldersWithConversations: options.foldersWithConversations ?? [],
    unfoldedConversations: options.unfoldedConversations ?? [],
    setSearchTerm: options.setSearchTerm ?? vi.fn<(term: string) => void>(),
    handleNewChat: options.handleNewChat ?? vi.fn<(folderId?: string) => Promise<void>>(),
  };
}

export function createMockThemeHook(theme = "dark") {
  return { theme, setTheme: vi.fn() };
}

export interface MockDragDropHookOptions {
  isDragOver?: boolean;
  handleDrop?: ReturnType<typeof vi.fn>;
  handleDragOver?: ReturnType<typeof vi.fn>;
  handleDragLeave?: ReturnType<typeof vi.fn>;
  handleDragEnter?: ReturnType<typeof vi.fn>;
}

export function createMockDragDropHook(options: MockDragDropHookOptions = {}) {
  return {
    isDragOver: options.isDragOver ?? false,
    handleDrop: options.handleDrop ?? vi.fn(),
    handleDragOver: options.handleDragOver ?? vi.fn(),
    handleDragLeave: options.handleDragLeave ?? vi.fn(),
    handleDragEnter: options.handleDragEnter ?? vi.fn(),
  };
}

export interface MockFileUploadHookOptions {
  attachedFiles?: File[];
  handleFilesSelected?: ReturnType<typeof vi.fn>;
  removeFile?: ReturnType<typeof vi.fn>;
  clearFiles?: ReturnType<typeof vi.fn>;
  replaceFiles?: ReturnType<typeof vi.fn>;
  processFile?: ReturnType<typeof vi.fn>;
}

export function createMockFileUploadHook(options: MockFileUploadHookOptions = {}) {
  return {
    attachedFiles: options.attachedFiles ?? [],
    handleFilesSelected: options.handleFilesSelected ?? vi.fn(),
    removeFile: options.removeFile ?? vi.fn(),
    clearFiles: options.clearFiles ?? vi.fn(),
    replaceFiles: options.replaceFiles ?? vi.fn(),
    processFile: options.processFile ?? vi.fn(),
  };
}

export interface MockSpeechToTextHookOptions {
  status?: "ready" | "recording" | "processing";
  startRecording?: ReturnType<typeof vi.fn>;
  stopRecording?: ReturnType<typeof vi.fn>;
  isModelLoading?: boolean;
  error?: string | null;
}

export function createMockSpeechToTextHook(options: MockSpeechToTextHookOptions = {}) {
  return {
    status: options.status ?? ("ready" as const),
    startRecording: options.startRecording ?? vi.fn(),
    stopRecording: options.stopRecording ?? vi.fn(),
    isModelLoading: options.isModelLoading ?? false,
    error: options.error ?? null,
  };
}

/**
 * Options for creating a useMessageStream mock
 */
export interface MockMessageStreamHookOptions {
  isGenerating?: boolean;
  streamResponse?: ReturnType<typeof vi.fn>;
  stopGeneration?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a useMessageStream hook mock return value
 *
 * @example
 * vi.mock("./useMessageStream", async () => {
 *   const { createMockMessageStreamHook } = await import("@/test/mocks/hooks");
 *   return {
 *     useMessageStream: () => createMockMessageStreamHook({ isGenerating: false }),
 *   };
 * });
 */
export function createMockMessageStreamHook(options: MockMessageStreamHookOptions = {}) {
  return {
    isGenerating: options.isGenerating ?? false,
    streamResponse: options.streamResponse ?? vi.fn().mockResolvedValue({ content: "AI response", wasAborted: false }),
    stopGeneration: options.stopGeneration ?? vi.fn(),
  };
}

/**
 * Options for creating a useSidebar mock
 */
export interface MockSidebarHookOptions {
  open?: boolean;
  setOpen?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a useSidebar hook mock return value
 */
export function createMockSidebarHook(options: MockSidebarHookOptions = {}) {
  return {
    open: options.open ?? false,
    setOpen: options.setOpen ?? vi.fn(),
  };
}

/**
 * Options for creating a transcriber mock
 */
export interface MockTranscriberOptions {
  getTranscriber?: ReturnType<typeof vi.fn>;
  disposeTranscriber?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a transcriber mock for lib/transcriber
 */
export function createMockTranscriber(options: MockTranscriberOptions = {}) {
  return {
    getTranscriber: options.getTranscriber ?? vi.fn().mockResolvedValue(
      vi.fn().mockResolvedValue({ text: "" })
    ),
    disposeTranscriber: options.disposeTranscriber ?? vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Options for creating a useDocuments mock
 */
export interface MockDocumentsHookOptions {
  uploadDocument?: ReturnType<typeof vi.fn>;
}

/**
 * Creates a useDocuments hook mock return value
 */
export function createMockDocumentsHook(options: MockDocumentsHookOptions = {}) {
  return {
    uploadDocument: options.uploadDocument ?? vi.fn().mockResolvedValue({ id: 1, filename: "test.txt" }),
  };
}
