import { toast } from "sonner";

export interface ErrorAction {
  label: string;
  onClick: () => void;
}

export interface ParsedError {
  message: string;
  action: ErrorAction;
}

/**
 * Parses API errors and returns user-friendly messages with appropriate actions
 */
export function parseApiError(
  error: unknown,
  retryCallback?: () => void
): ParsedError {
  const defaultAction: ErrorAction = {
    label: "Retry",
    onClick: () => window.location.reload(),
  };

  if (!(error instanceof Error)) {
    return {
      message: "Failed to generate response. Please try again.",
      action: defaultAction,
    };
  }

  const errorMsg = error.message.toLowerCase();

  if (
    errorMsg.includes("api key") ||
    errorMsg.includes("unauthorized") ||
    errorMsg.includes("401")
  ) {
    return {
      message: "API key error. Please check your API key configuration in Settings.",
      action: {
        label: "Open Settings",
        onClick: () => {
          const settingsButton = document.querySelector("[data-settings-trigger]");
          if (settingsButton) {
            (settingsButton as HTMLElement).click();
          } else {
            window.location.reload();
          }
        },
      },
    };
  }

  if (
    errorMsg.includes("model not found") ||
    errorMsg.includes("model") ||
    errorMsg.includes("unsupported")
  ) {
    return {
      message: "Model configuration error. Please select a different model or check your settings.",
      action: {
        label: "Select Model",
        onClick: () => {
          const modelSelector = document.querySelector("[data-model-selector]");
          if (modelSelector) {
            (modelSelector as HTMLElement).click();
          } else {
            window.location.reload();
          }
        },
      },
    };
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("network")) {
    return {
      message: "Network error. Please check your connection and try again.",
      action: retryCallback
        ? { label: "Retry", onClick: retryCallback }
        : defaultAction,
    };
  }

  if (
    errorMsg.includes("rate limit") ||
    errorMsg.includes("quota") ||
    errorMsg.includes("429")
  ) {
    return {
      message: "API rate limit exceeded. Please wait a moment and try again.",
      action: retryCallback
        ? { label: "Retry in 10s", onClick: () => setTimeout(retryCallback, 10000) }
        : defaultAction,
    };
  }

  return {
    message: "Failed to generate response. Please try again.",
    action: retryCallback
      ? { label: "Retry", onClick: retryCallback }
      : defaultAction,
  };
}

/**
 * Shows an error toast with the parsed error information
 */
export function showErrorToast(error: unknown, retryCallback?: () => void): void {
  const parsed = parseApiError(error, retryCallback);
  toast.error(parsed.message, {
    action: {
      label: parsed.action.label,
      onClick: parsed.action.onClick,
    },
  });
}
