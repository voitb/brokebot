import { toast } from "sonner";

type NavigateFn = (options: { search: string }) => void;

interface ErrorToastOptions {
  onRetry?: () => void;
  navigate?: NavigateFn;
}

function navigateTo(target: string, navigate?: NavigateFn) {
  if (navigate) {
    navigate({ search: `modal=${target}` });
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", target);
    window.location.href = url.toString();
  }
}

function retryOrReload(onRetry?: () => void, delay?: number) {
  if (onRetry) {
    if (delay) {
      setTimeout(onRetry, delay);
    } else {
      onRetry();
    }
  } else {
    window.location.reload();
  }
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
    toast.error("Model configuration error. Please select a different model or check your settings.", {
      action: {
        label: "Select Model",
        onClick: () => navigateTo("model-selector", options?.navigate),
      },
    });
    return;
  }

  if (errorMsg.includes("rate limit") || errorMsg.includes("quota") || errorMsg.includes("429")) {
    toast.error("API rate limit exceeded. Please wait a moment and try again.", {
      action: {
        label: options?.onRetry ? "Retry in 10s" : "Retry",
        onClick: () => retryOrReload(options?.onRetry, options?.onRetry ? 10000 : undefined),
      },
    });
    return;
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("network")) {
    toast.error("Network error. Please check your connection and try again.", {
      action: {
        label: "Retry",
        onClick: () => retryOrReload(options?.onRetry),
      },
    });
    return;
  }

  toast.error("Failed to generate response. Please try again.", {
    action: {
      label: "Retry",
      onClick: () => retryOrReload(options?.onRetry),
    },
  });
}
