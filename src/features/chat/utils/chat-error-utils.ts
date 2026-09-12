import { toast } from "sonner";

type NavigateFn = (options: { search: string }) => void;

interface ErrorToastOptions {
  onRetry?: () => void;
  navigate?: NavigateFn;
}

const RETRY_DELAY_MS = 10_000;

function navigateTo(target: string, navigate?: NavigateFn) {
  if (navigate) {
    navigate({ search: `modal=${target}` });
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", target);
    window.location.href = url.toString();
  }
}

function createRetryAction(onRetry?: () => void, delayMs?: number) {
  if (!onRetry) return undefined;
  if (delayMs === undefined) {
    return { label: "Retry", onClick: onRetry };
  }
  return {
    label: `Retry in ${delayMs / 1000}s`,
    onClick: () => setTimeout(onRetry, delayMs),
  };
}

export function showErrorToast(error: unknown, options?: ErrorToastOptions): void {
  const errorMsg = error instanceof Error ? error.message.toLowerCase() : "";

  if (errorMsg.includes("api key") || errorMsg.includes("unauthorized") || errorMsg.includes("401")) {
    toast.error("API key error. Please check your API key configuration in Settings.", {
      action: {
        label: "Open Settings",
        onClick: () => navigateTo("settings", options?.navigate),
      },
    });
    return;
  }

  if (errorMsg.includes("model not found") || errorMsg.includes("invalid model") || errorMsg.includes("unsupported")) {
    toast.error("Model configuration error. Please select a different model or check your settings.");
    return;
  }

  if (errorMsg.includes("context window") || errorMsg.includes("context length")) {
    toast.error(
      "This conversation is too long for the selected model. Start a new chat or pick a model with a larger context."
    );
    return;
  }

  if (errorMsg.includes("rate limit") || errorMsg.includes("quota") || /\b429\b/.test(errorMsg)) {
    toast.error("API rate limit exceeded. Please wait a moment and try again.", {
      action: createRetryAction(options?.onRetry, RETRY_DELAY_MS),
    });
    return;
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("network")) {
    toast.error("Network error. Please check your connection and try again.", {
      action: createRetryAction(options?.onRetry),
    });
    return;
  }

  toast.error("Failed to generate response. Please try again.", {
    action: createRetryAction(options?.onRetry),
  });
}
