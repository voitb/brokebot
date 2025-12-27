import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseApiError, showErrorToast } from "./chatErrorUtils";
import { mockToast } from "../../../../test/mocks/modules";

describe("chatErrorUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseApiError", () => {
    it("returns default message for non-Error objects", () => {
      const result = parseApiError("string error");

      expect(result.message).toBe("Failed to generate response. Please try again.");
      expect(result.actionLabel).toBe("Retry");
      expect(result.actionType).toEqual({ type: "reload" });
    });

    it("handles API key errors", () => {
      const error = new Error("Invalid API key provided");

      const result = parseApiError(error);

      expect(result.message).toContain("API key error");
      expect(result.actionLabel).toBe("Open Settings");
      expect(result.actionType).toEqual({ type: "navigate", target: "settings" });
    });

    it("handles 401 unauthorized errors", () => {
      const error = new Error("401 Unauthorized");

      const result = parseApiError(error);

      expect(result.message).toContain("API key error");
      expect(result.actionType).toEqual({ type: "navigate", target: "settings" });
    });

    it("handles model not found errors", () => {
      const error = new Error("Model not found: gpt-5");

      const result = parseApiError(error);

      expect(result.message).toContain("Model configuration error");
      expect(result.actionLabel).toBe("Select Model");
      expect(result.actionType).toEqual({ type: "navigate", target: "model-selector" });
    });

    it("handles unsupported model errors", () => {
      const error = new Error("Unsupported model version");

      const result = parseApiError(error);

      expect(result.message).toContain("Model configuration error");
      expect(result.actionType).toEqual({ type: "navigate", target: "model-selector" });
    });

    it("handles network errors with retry callback", () => {
      const retryFn = vi.fn();
      const error = new Error("Network timeout");

      const result = parseApiError(error, { onRetry: retryFn });

      expect(result.message).toContain("Network error");
      expect(result.actionLabel).toBe("Retry");
      expect(result.actionType).toEqual({ type: "retry" });
    });

    it("handles rate limit errors without callback", () => {
      const error = new Error("Rate limit exceeded");

      const result = parseApiError(error);

      expect(result.message).toContain("rate limit");
      expect(result.actionLabel).toBe("Retry");
      expect(result.actionType).toEqual({ type: "reload" });
    });

    it("handles rate limit errors with retry callback", () => {
      const retryFn = vi.fn();
      const error = new Error("Rate limit exceeded");

      const result = parseApiError(error, { onRetry: retryFn });

      expect(result.message).toContain("rate limit");
      expect(result.actionLabel).toBe("Retry in 10s");
      expect(result.actionType).toEqual({ type: "retry", delay: 10000 });
    });

    it("handles 429 quota errors", () => {
      const error = new Error("429 Too Many Requests - quota exceeded");

      const result = parseApiError(error);

      expect(result.message).toContain("rate limit");
    });

    it("returns generic error for unknown errors", () => {
      const error = new Error("Something completely unexpected");

      const result = parseApiError(error);

      expect(result.message).toBe("Failed to generate response. Please try again.");
    });

    it("returns retry action type when onRetry is provided", () => {
      const retryFn = vi.fn();
      const error = new Error("Something unexpected");

      const result = parseApiError(error, { onRetry: retryFn });

      expect(result.actionType).toEqual({ type: "retry" });
    });
  });

  describe("showErrorToast", () => {
    it("calls toast.error with parsed error info", () => {
      const error = new Error("API key invalid");

      showErrorToast(error);

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("API key error"),
        expect.objectContaining({
          action: expect.objectContaining({
            label: "Open Settings",
          }),
        })
      );
    });

    it("passes retry callback via options to parseApiError", () => {
      const retryFn = vi.fn();
      const error = new Error("Network timeout");

      showErrorToast(error, { onRetry: retryFn });

      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Network error"),
        expect.objectContaining({
          action: expect.objectContaining({
            label: "Retry",
          }),
        })
      );
    });

    it("passes navigate via options", () => {
      const navigateFn = vi.fn();
      const error = new Error("API key invalid");

      showErrorToast(error, { navigate: navigateFn });

      expect(mockToast.error).toHaveBeenCalled();
    });
  });
});
