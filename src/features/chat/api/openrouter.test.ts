import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOpenRouterClient } from "./openrouter";
import { setupFetchMock } from "@/testing/mocks/modules";

const { mockFetch } = setupFetchMock();

describe("createOpenRouterClient", () => {
  const validApiKey = "sk-or-v1-test-key-12345678901234567890";

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("testConnection", () => {
    it("returns error for invalid API key format", async () => {
      const client = createOpenRouterClient("invalid-key");
      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid OpenRouter API key format");
    });

    it("returns success for valid API key", async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 });

      const client = createOpenRouterClient(validApiKey);
      const result = await client.testConnection();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/auth/key",
        expect.objectContaining({
          method: "GET",
          headers: { Authorization: `Bearer ${validApiKey}` },
        })
      );
    });

    it("returns error for 401 or network failure", async () => {
      mockFetch.mockResolvedValueOnce({ status: 401 });

      const client = createOpenRouterClient(validApiKey);
      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid API key");

      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const result2 = await client.testConnection();

      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Network error");
    });
  });

  describe("streamCompletion", () => {
    it("yields error for invalid API key format", async () => {
      const client = createOpenRouterClient("bad-key");

      const stream = client.streamCompletion("gpt-4", [
        { role: "user", content: "Hi" },
      ]);

      const result = await stream.next();
      expect(result.value?.error).toContain("Invalid OpenRouter API key format");
    });

    it("handles abort signal", async () => {
      const abortController = new AbortController();
      abortController.abort();

      mockFetch.mockRejectedValueOnce(
        Object.assign(new Error("Aborted"), { name: "AbortError" })
      );

      const client = createOpenRouterClient(validApiKey);

      const stream = client.streamCompletion(
        "gpt-4",
        [{ role: "user", content: "Hi" }],
        { signal: abortController.signal }
      );

      const result = await stream.next();
      expect(result.value?.error).toBe("stopped");
    });
  });
});
