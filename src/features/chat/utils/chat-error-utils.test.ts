import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showErrorToast } from "./chat-error-utils";
import { mockToast } from "@/testing/mocks/modules";

interface ToastAction {
  label: string;
  onClick: () => void;
}

function lastToastAction(): ToastAction | undefined {
  const call = mockToast.error.mock.calls.at(-1);
  return call?.[1]?.action;
}

describe("showErrorToast", () => {
  it("offers an immediate Retry that reruns the failed request", () => {
    const onRetry = vi.fn();
    showErrorToast(new Error("something broke"), { onRetry });

    expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe("Failed to generate response. Please try again.");
    expect(lastToastAction()?.label).toBe("Retry");
    lastToastAction()!.onClick();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("offers no action when the caller gives no retry handler", () => {
    showErrorToast(new Error("something broke"));

    expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe("Failed to generate response. Please try again.");
    expect(lastToastAction()).toBeUndefined();
  });

  describe("when the API is rate limited", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("defers the retry on a rate-limit error", () => {
      const onRetry = vi.fn();
      showErrorToast(new Error("Rate limit exceeded"), { onRetry });

      expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe("API rate limit exceeded. Please wait a moment and try again.");
      expect(lastToastAction()?.label).toBe("Retry in 10s");
      lastToastAction()!.onClick();
      expect(onRetry).not.toHaveBeenCalled();
      vi.advanceTimersByTime(10_000);
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  it("treats a 429 embedded in a longer number as an ordinary failure", () => {
    const onRetry = vi.fn();
    showErrorToast(new Error("upstream failure, trace id 84291"), { onRetry });

    expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe("Failed to generate response. Please try again.");
    expect(lastToastAction()?.label).toBe("Retry");
  });

  it("routes an API key error into Settings instead of offering a retry", () => {
    const onRetry = vi.fn();
    const navigate = vi.fn();
    showErrorToast(new Error("Invalid API key"), { onRetry, navigate });

    expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe("API key error. Please check your API key configuration in Settings.");
    expect(lastToastAction()?.label).toBe("Open Settings");
    lastToastAction()!.onClick();
    expect(navigate).toHaveBeenCalledWith({ search: "modal=settings" });
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("offers no retry when the conversation exceeds the model context window", () => {
    const onRetry = vi.fn();
    showErrorToast(
      new Error("Prompt tokens exceed context window size: number of prompt tokens: 4293; context window size: 4096"),
      { onRetry }
    );

    expect(mockToast.error.mock.calls.at(-1)?.[0]).toBe(
      "This conversation is too long for the selected model. Start a new chat or pick a model with a larger context."
    );
    expect(lastToastAction()).toBeUndefined();
  });

  it("offers no retry for a model configuration error", () => {
    const onRetry = vi.fn();
    showErrorToast(new Error("invalid model"), { onRetry });

    expect(mockToast.error).toHaveBeenCalledWith("Model configuration error. Please select a different model or check your settings.");
    expect(lastToastAction()).toBeUndefined();
  });
});
