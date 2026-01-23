export {
  findLastMessageByRole,
  truncateTitle,
  summarizeConversation,
  buildPrompt,
  formatAttachedFiles,
  buildMessageWithFiles,
  ERROR_MESSAGE_PREFIX,
  type PromptMode,
} from "./chat-input-utils";

export { parseMessage } from "./parse-message";

export {
  parseApiError,
  showErrorToast,
  type ErrorActionType,
  type ParsedError,
  type ParseErrorOptions,
} from "./chat-error-utils";

export {
  processFile,
  validateFile,
  readFileContent,
  type AttachedFile,
  type ValidateFileOptions,
  type ValidationResult,
} from "./file-upload-utils";

export { formatMessageTime } from "./format-message-time";

export {
  escapeHTML,
  generateHTML,
  generateMarkdown,
  downloadFile,
} from "./export-utils";

export {
  getModelStatusKey,
  getStatusColor,
  getDisplayedStatus,
  type ModelStatusKey,
  type ModelStatusFlags,
} from "./model-status-utils";

export { getDisplayName } from "./model-selector-utils";

export {
  getTooltipText,
  getIconConfig,
  isSpeechButtonDisabled,
  isRecordingActive,
  STATUS_TOOLTIP,
  STATUS_ICON,
  type IconType,
  type IconConfig,
} from "./speech-button-utils";

export {
  getCategoryIcon as getOnlineCategoryIcon,
  filterModelsByQuery,
  type OnlineModelCategory,
} from "./online-model-utils";

export {
  getCategoryIcon as getLocalCategoryIcon,
  getCategoryLabel,
  getCategoryTooltip,
  getModelTypeIcon,
  getSpecializationIcon,
  getPerformanceBadgeVariant,
  type LocalModelCategory,
  type ModelType,
  type Specialization,
  type PerformanceLevel,
} from "./local-model-utils";
