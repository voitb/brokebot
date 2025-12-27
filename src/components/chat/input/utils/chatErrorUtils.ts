import { toast } from "sonner";

type NavigateFn = (options: { search: string }) => void;

export interface ErrorAction {
  label: string;
  onClick: () => void;
}

export interface ParsedError {
  message: string;
  action: ErrorAction;
}

function navigateToSettings(navigate?: NavigateFn) {
  if (navigate) {
    navigate({ search: "modal=settings" });
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", "settings");
    window.location.href = url.toString();
  }
}

function navigateToModelSelector(navigate?: NavigateFn) {
  if (navigate) {
    navigate({ search: "modal=model-selector" });
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", "model-selector");
    window.location.href = url.toString();
  }
}

export function parseApiError(
  error: unknown,
  retryCallback?: () => void,
  navigate?: NavigateFn
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
        onClick: () => navigateToSettings(navigate),
      },
    };
  }

  if (
    errorMsg.includes("model not found") ||
    errorMsg.includes("invalid model") ||
    errorMsg.includes("unsupported")
  ) {
    return {
      message: "Model configuration error. Please select a different model or check your settings.",
      action: {
        label: "Select Model",
        onClick: () => navigateToModelSelector(navigate),
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

export function showErrorToast(
  error: unknown,
  retryCallback?: () => void,
  navigate?: NavigateFn
): void {
  const parsed = parseApiError(error, retryCallback, navigate);
  toast.error(parsed.message, {
    action: {
      label: parsed.action.label,
      onClick: parsed.action.onClick,
    },
  });
}
