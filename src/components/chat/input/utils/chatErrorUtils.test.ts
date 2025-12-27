import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseApiError, showErrorToast } from "./chatErrorUtils";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("chatErrorUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseApiError", () => {
    it("returns default message for non-Error objects", () => {
      const result = parseApiError("string error");

      expect(result.message).toBe("Failed to generate response. Please try again.");
      expect(result.action.label).toBe("Retry");
    });

    it("handles API key errors", () => {
      const error = new Error("Invalid API key provided");

      const result = parseApiError(error);

      expect(result.message).toContain("API key error");
      expect(result.action.label).toBe("Open Settings");
    });

    it("handles 401 unauthorized errors", () => {
      const error = new Error("401 Unauthorized");

      const result = parseApiError(error);

      expect(result.message).toContain("API key error");
    });

    it("handles model not found errors", () => {
      const error = new Error("Model not found: gpt-5");

      const result = parseApiError(error);

      expect(result.message).toContain("Model configuration error");
      expect(result.action.label).toBe("Select Model");
    });

    it("handles unsupported model errors", () => {
      const error = new Error("Unsupported model version");

      const result = parseApiError(error);

      expect(result.message).toContain("Model configuration error");
    });

    it("handles network errors with retry callback", () => {
      const retryFn = vi.fn();
      const error = new Error("Network timeout");

      const result = parseApiError(error, retryFn);

      expect(result.message).toContain("Network error");
      expect(result.action.label).toBe("Retry");

      result.action.onClick();
      expect(retryFn).toHaveBeenCalled();
    });

    it("handles rate limit errors without callback", () => {
      const error = new Error("Rate limit exceeded");

      const result = parseApiError(error);

      expect(result.message).toContain("rate limit");
      // Without retry callback, falls back to default Retry action
      expect(result.action.label).toBe("Retry");
    });

    it("handles rate limit errors with retry callback", () => {
      const retryFn = vi.fn();
      const error = new Error("Rate limit exceeded");

      const result = parseApiError(error, retryFn);

      expect(result.message).toContain("rate limit");
      expect(result.action.label).toBe("Retry in 10s");
    });

    it("handles 429 quota errors", () => {
      const error = new Error("429 Too Many Requests - quota exceeded");

      const result = parseApiError(error);

      expect(result.message).toContain("rate limit");
    });

    it("provides delayed retry for rate limit with callback", () => {
      vi.useFakeTimers();
      const retryFn = vi.fn();
      const error = new Error("Rate limit");

      const result = parseApiError(error, retryFn);

      result.action.onClick();
      expect(retryFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(10000);
      expect(retryFn).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it("returns generic error for unknown errors", () => {
      const error = new Error("Something completely unexpected");

      const result = parseApiError(error);

      expect(result.message).toBe("Failed to generate response. Please try again.");
    });
  });

  describe("showErrorToast", () => {
    it("calls toast.error with parsed error info", () => {
      const error = new Error("API key invalid");

      showErrorToast(error);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("API key error"),
        expect.objectContaining({
          action: expect.objectContaining({
            label: "Open Settings",
          }),
        })
      );
    });

    it("passes retry callback to parseApiError", () => {
      const retryFn = vi.fn();
      const error = new Error("Network timeout");

      showErrorToast(error, retryFn);

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Network error"),
        expect.objectContaining({
          action: expect.objectContaining({
            label: "Retry",
          }),
        })
      );
    });
  });
});
