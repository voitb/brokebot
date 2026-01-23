import { toast } from "sonner";

type NavigateFn = (options: { search: string }) => void;

export type ErrorActionType =
  | { type: "retry"; delay?: number }
  | { type: "navigate"; target: "settings" | "model-selector" }
  | { type: "reload" };

export interface ParsedError {
  message: string;
  actionType: ErrorActionType;
  actionLabel: string;
}

export interface ParseErrorOptions {
  onRetry?: () => void;
  navigate?: NavigateFn;
}

function executeAction(actionType: ErrorActionType, options: ParseErrorOptions): void {
  switch (actionType.type) {
    case "retry":
      if (options.onRetry) {
        if (actionType.delay) {
          setTimeout(options.onRetry, actionType.delay);
        } else {
          options.onRetry();
        }
      } else {
        window.location.reload();
      }
      break;
    case "navigate":
      if (options.navigate) {
        options.navigate({ search: `modal=${actionType.target}` });
      } else {
        const url = new URL(window.location.href);
        url.searchParams.set("modal", actionType.target);
        window.location.href = url.toString();
      }
      break;
    case "reload":
      window.location.reload();
      break;
  }
}

export function parseApiError(error: unknown, options?: ParseErrorOptions): ParsedError {
  const hasRetry = options?.onRetry !== undefined;

  if (!(error instanceof Error)) {
    return {
      message: "Failed to generate response. Please try again.",
      actionType: hasRetry ? { type: "retry" } : { type: "reload" },
      actionLabel: "Retry",
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
      actionType: { type: "navigate", target: "settings" },
      actionLabel: "Open Settings",
    };
  }

  if (
    errorMsg.includes("model not found") ||
    errorMsg.includes("invalid model") ||
    errorMsg.includes("unsupported")
  ) {
    return {
      message: "Model configuration error. Please select a different model or check your settings.",
      actionType: { type: "navigate", target: "model-selector" },
      actionLabel: "Select Model",
    };
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("network")) {
    return {
      message: "Network error. Please check your connection and try again.",
      actionType: hasRetry ? { type: "retry" } : { type: "reload" },
      actionLabel: "Retry",
    };
  }

  if (
    errorMsg.includes("rate limit") ||
    errorMsg.includes("quota") ||
    errorMsg.includes("429")
  ) {
    return {
      message: "API rate limit exceeded. Please wait a moment and try again.",
      actionType: hasRetry ? { type: "retry", delay: 10000 } : { type: "reload" },
      actionLabel: hasRetry ? "Retry in 10s" : "Retry",
    };
  }

  return {
    message: "Failed to generate response. Please try again.",
    actionType: hasRetry ? { type: "retry" } : { type: "reload" },
    actionLabel: "Retry",
  };
}

export function showErrorToast(error: unknown, options?: ParseErrorOptions): void {
  const parsed = parseApiError(error, options);
  toast.error(parsed.message, {
    action: {
      label: parsed.actionLabel,
      onClick: () => executeAction(parsed.actionType, options ?? {}),
    },
  });
}
