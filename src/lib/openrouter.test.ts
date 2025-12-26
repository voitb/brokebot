import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  OpenRouterClient,
  getCategoryFromModel,
  getStoredApiKeys,
  storeApiKeys,
} from "./openrouter";
import * as encryptionService from "./encryptionService";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock encryption service
vi.mock("./encryptionService", () => ({
  encryptValue: vi.fn((val: string) => Promise.resolve(`encrypted_${val}`)),
  decryptValue: vi.fn((val: string) =>
    Promise.resolve(val.replace("encrypted_", ""))
  ),
}));

describe("openrouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getCategoryFromModel", () => {
    it('returns "multimodal" for vision models', () => {
      const model = { id: "gpt-4-vision", name: "GPT-4 Vision", description: "" };
      expect(getCategoryFromModel(model)).toBe("multimodal");
    });

    it('returns "multimodal" for models with multimodal description', () => {
      const model = {
        id: "model-1",
        name: "Model",
        description: "A multimodal model",
      };
      expect(getCategoryFromModel(model)).toBe("multimodal");
    });

    it('returns "reasoning" for Claude Sonnet models', () => {
      const model = {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        description: "",
      };
      expect(getCategoryFromModel(model)).toBe("reasoning");
    });

    it('returns "reasoning" for GPT-4 models', () => {
      const model = { id: "gpt-4", name: "GPT-4", description: "" };
      expect(getCategoryFromModel(model)).toBe("reasoning");
    });

    it('returns "efficient" for flash models', () => {
      const model = { id: "gemini-flash", name: "Gemini Flash", description: "" };
      expect(getCategoryFromModel(model)).toBe("efficient");
    });

    it('returns "efficient" for haiku models', () => {
      const model = { id: "claude-3-haiku", name: "Claude 3 Haiku", description: "" };
      expect(getCategoryFromModel(model)).toBe("efficient");
    });

    it('returns "efficient" for mini models', () => {
      // Note: GPT-4o Mini matches "gpt-4" first, so use a different mini model
      const model = { id: "claude-mini", name: "Claude Mini", description: "" };
      expect(getCategoryFromModel(model)).toBe("efficient");
    });

    it('returns "reasoning" for GPT-4o Mini (matches gpt-4 first)', () => {
      const model = { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "" };
      expect(getCategoryFromModel(model)).toBe("reasoning");
    });

    it('returns "instruction" for code models', () => {
      const model = { id: "deepseek-code", name: "DeepSeek", description: "" };
      expect(getCategoryFromModel(model)).toBe("instruction");
    });

    it('returns "instruction" for coding description', () => {
      const model = {
        id: "model-1",
        name: "Model",
        description: "Optimized for coding tasks",
      };
      expect(getCategoryFromModel(model)).toBe("instruction");
    });

    it('returns "instruction" for instruct models', () => {
      const model = { id: "llama-instruct", name: "Llama Instruct", description: "" };
      expect(getCategoryFromModel(model)).toBe("instruction");
    });

    it('returns "general" for other models', () => {
      const model = { id: "mixtral-8x7b", name: "Mixtral 8x7B", description: "" };
      expect(getCategoryFromModel(model)).toBe("general");
    });
  });

  describe("OpenRouterClient", () => {
    const validApiKey = "sk-or-v1-test-key-12345678901234567890";

    describe("constructor", () => {
      it("uses provided site config", () => {
        const client = new OpenRouterClient({
          siteUrl: "https://example.com",
          siteName: "TestApp",
          keys: { openrouterApiKey: validApiKey },
        });

        expect(client).toBeDefined();
      });
    });

    describe("testApiKey", () => {
      it("returns error when API key is not set", async () => {
        const client = new OpenRouterClient({
          keys: {},
        });

        const result = await client.testApiKey();

        expect(result.success).toBe(false);
        expect(result.error).toContain("not found");
      });

      it("returns error for invalid API key format", async () => {
        const client = new OpenRouterClient({
          keys: { openrouterApiKey: "invalid-key" },
        });

        const result = await client.testApiKey();

        expect(result.success).toBe(false);
        expect(result.error).toContain("Invalid OpenRouter API key format");
      });

      it("returns success for valid API key", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
        });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.testApiKey();

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://openrouter.ai/api/v1/auth/key",
          expect.objectContaining({
            method: "GET",
            headers: { Authorization: `Bearer ${validApiKey}` },
          })
        );
      });

      it("returns error for 401 response", async () => {
        mockFetch.mockResolvedValueOnce({
          status: 401,
        });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.testApiKey();

        expect(result.success).toBe(false);
        expect(result.error).toContain("Invalid API key");
      });

      it("handles network errors", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.testApiKey();

        expect(result.success).toBe(false);
        expect(result.error).toContain("Network error");
      });
    });

    describe("sendMessage", () => {
      it("throws when API key is missing", async () => {
        const client = new OpenRouterClient({ keys: {} });

        await expect(
          client.sendMessage("gpt-4", [{ role: "user", content: "Hi" }])
        ).rejects.toThrow("API key not found");
      });

      it("throws for invalid API key format", async () => {
        const client = new OpenRouterClient({
          keys: { openrouterApiKey: "bad-key" },
        });

        await expect(
          client.sendMessage("gpt-4", [{ role: "user", content: "Hi" }])
        ).rejects.toThrow("Invalid OpenRouter API key format");
      });

      it("returns response content on success", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "Hello there!" } }],
            }),
        });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.sendMessage("gpt-4", [
          { role: "user", content: "Hi" },
        ]);

        expect(result).toBe("Hello there!");
      });

      it("throws on API error", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { message: "Server error" } }),
        });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        await expect(
          client.sendMessage("gpt-4", [{ role: "user", content: "Hi" }])
        ).rejects.toThrow("Server error");
      });
    });

    describe("streamCompletion", () => {
      it("yields error when API key is missing", async () => {
        const client = new OpenRouterClient({ keys: {} });

        const stream = client.streamCompletion("gpt-4", [
          { role: "user", content: "Hi" },
        ]);

        const result = await stream.next();
        expect(result.value?.error).toContain("API key not found");
      });

      it("yields error for invalid API key format", async () => {
        const client = new OpenRouterClient({
          keys: { openrouterApiKey: "bad-key" },
        });

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

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const stream = client.streamCompletion(
          "gpt-4",
          [{ role: "user", content: "Hi" }],
          undefined,
          abortController.signal
        );

        const result = await stream.next();
        expect(result.value?.error).toBe("stopped");
      });
    });

    describe("testConnection", () => {
      it("returns true when testApiKey succeeds", async () => {
        mockFetch.mockResolvedValueOnce({ status: 200 });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.testConnection();
        expect(result).toBe(true);
      });

      it("returns false when testApiKey fails", async () => {
        mockFetch.mockResolvedValueOnce({ status: 401 });

        const client = new OpenRouterClient({
          keys: { openrouterApiKey: validApiKey },
        });

        const result = await client.testConnection();
        expect(result).toBe(false);
      });
    });
  });

  describe("getStoredApiKeys", () => {
    it("returns empty object when no keys stored", async () => {
      const result = await getStoredApiKeys();
      expect(result).toEqual({});
    });

    it("returns decrypted keys from localStorage", async () => {
      localStorage.setItem(
        "apiKeys",
        JSON.stringify({ openrouterApiKey: "encrypted_test-key" })
      );

      const result = await getStoredApiKeys();

      expect(result.openrouterApiKey).toBe("test-key");
      expect(encryptionService.decryptValue).toHaveBeenCalledWith(
        "encrypted_test-key"
      );
    });

    it("handles invalid JSON in localStorage", async () => {
      localStorage.setItem("apiKeys", "not-json");

      const result = await getStoredApiKeys();

      expect(result).toEqual({});
    });
  });

  describe("storeApiKeys", () => {
    it("encrypts and stores keys in localStorage", async () => {
      await storeApiKeys({ openrouterApiKey: "my-api-key" });

      const stored = localStorage.getItem("apiKeys");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.openrouterApiKey).toBe("encrypted_my-api-key");
      expect(encryptionService.encryptValue).toHaveBeenCalledWith("my-api-key");
    });

    it("merges with existing keys", async () => {
      localStorage.setItem(
        "apiKeys",
        JSON.stringify({ openrouterApiKey: "encrypted_old-key" })
      );

      await storeApiKeys({ openrouterApiKey: "new-key" });

      const stored = localStorage.getItem("apiKeys");
      const parsed = JSON.parse(stored!);
      expect(parsed.openrouterApiKey).toBe("encrypted_new-key");
    });
  });
});
