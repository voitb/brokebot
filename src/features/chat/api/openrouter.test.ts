import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOpenRouterClient, type StreamResponse } from "./openrouter";
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

    it("falls back to the response status when the error body carries an empty message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: () => Promise.resolve({ error: { message: "" } }),
      });

      const client = createOpenRouterClient(validApiKey);

      const stream = client.streamCompletion("gpt-4", [
        { role: "user", content: "Hi" },
      ]);

      const result = await stream.next();
      expect(result.value?.error).toBe("API request failed with status 502");
    });

    it("caps the reply by sending max_tokens in the completion body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const client = createOpenRouterClient(validApiKey);
      await client.streamCompletion("gpt-4", [{ role: "user", content: "Hi" }]).next();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          body: expect.stringContaining('"max_tokens":4096'),
        })
      );
    });

    it("yields Hi from a valid SSE delta chunk", async () => {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: {"choices":[{"delta":{"content":"Hi"}}]}\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, body });

      const client = createOpenRouterClient(validApiKey);
      const chunks: StreamResponse[] = [];
      for await (const chunk of client.streamCompletion("gpt-4", [
        { role: "user", content: "Hi" },
      ])) {
        chunks.push(chunk);
      }

      expect(chunks.some((chunk) => chunk.content === "Hi")).toBe(true);
      expect(chunks.at(-1)).toEqual({ content: "Hi", isComplete: true, isTruncated: false });
    });

    it("marks the final chunk as truncated when the reply stops on the token cap", async () => {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: {"choices":[{"delta":{"content":"Cut"}}]}\n`)
          );
          controller.enqueue(
            encoder.encode(`data: {"choices":[{"delta":{},"finish_reason":"length"}]}\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        },
      });
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, body });

      const client = createOpenRouterClient(validApiKey);
      const chunks: StreamResponse[] = [];
      for await (const chunk of client.streamCompletion("gpt-4", [
        { role: "user", content: "Hi" },
      ])) {
        chunks.push(chunk);
      }

      expect(chunks.at(-1)).toEqual({ content: "Cut", isComplete: true, isTruncated: true });
    });
  });
});
