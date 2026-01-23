export { useChatInput } from "./use-chat-input";
export {
  useChatInputForm,
  type UseChatInputFormProps,
  type UseChatInputFormReturn,
  type ModelDisplayInfo,
} from "../components/input/chat-input/use-chat-input-form";
export { useTextareaAutoResize } from "./use-textarea-auto-resize";
export { useDragDrop } from "./use-drag-drop";
export { useFileUpload } from "./use-file-upload";
export {
  useSpeechToText,
  type TranscriberStatus,
  type UseSpeechToTextResult,
} from "./use-speech-to-text";

// Re-exported from co-located component for backwards compatibility
export {
  useChatMessages,
  type UseChatMessagesProps,
  type UseChatMessagesReturn,
} from "../components/messages/chat-messages/use-chat-messages";
export {
  useMessageStream,
  type StreamResult,
} from "./use-message-stream";
export {
  useSmartAutoScroll,
  type UseSmartAutoScrollOptions,
  type UseSmartAutoScrollReturn,
} from "./use-smart-auto-scroll";

export { useModels } from "./use-models";
// Re-exported from co-located component for backwards compatibility
export {
  useOnlineModels,
  type UseOnlineModelsReturn,
} from "../components/online-model-dialog/use-online-models";
export {
  useModelSelector,
  type UseModelSelectorReturn,
} from "./use-model-selector";
// Re-exported from co-located component for backwards compatibility
export {
  useModelSelectorDropdown,
  type UseModelSelectorDropdownReturn,
} from "../components/model-selector-dropdown/use-model-selector-dropdown";

// Re-exported from shared hooks for backwards compatibility
export { useConversationId } from "@/hooks";
export { useConversationList, type FolderWithConversations } from "@/hooks";
// Re-exported from co-located sidebar components for backwards compatibility
export {
  useConversationItem,
  type UseConversationItemReturn,
} from "../components/sidebar/conversation-item";
export {
  useFolderItem,
  type UseFolderItemReturn,
} from "../components/sidebar/folder-item";
export { useChatGuard } from "./use-chat-guard";

// Re-exported from co-located chat-header component for backwards compatibility
export {
  useHeaderActions,
  useTitleEdit,
  useConversationIO,
  useConversationDelete,
} from "../components/header/chat-header";
// Re-exported from co-located component for backwards compatibility
export {
  useApiKeyManager,
  type UseApiKeyManagerReturn,
} from "../components/online-model-dialog/use-api-key-manager";

// Re-exported from co-located component for backwards compatibility
export { useCodeHighlighting } from "../components/messages/code-block/use-code-highlighting";
