import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useModels } from "./useModels";

import { setupFetchMock } from "@/test/mocks/modules";

const { mockFetch } = setupFetchMock();

describe("useModels", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with loading true", () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useModels());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.models).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("successful fetch", () => {
    it("fetches models from OpenRouter API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "openai/gpt-4",
              name: "GPT-4",
              description: "OpenAI GPT-4",
              context_length: 8192,
              pricing: { prompt: "0.03", completion: "0.06" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/models");
      expect(result.current.models).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });

    it("formats models correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "anthropic/claude-3-opus",
              name: "Claude 3 Opus",
              description: "Anthropic's most capable model",
              context_length: 200000,
              pricing: { prompt: "0.015", completion: "0.075" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const model = result.current.models[0];
      expect(model.id).toBe("anthropic/claude-3-opus");
      expect(model.name).toBe("Claude 3 Opus");
      expect(model.description).toBe("Anthropic's most capable model");
      expect(model.contextLength).toBe(200000);
      expect(model.provider).toBe("anthropic");
      expect(model.isFree).toBe(false);
    });

    it("identifies free models", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "google/gemma-7b-it:free",
              name: "Gemma 7B Free",
              description: "Free model",
              context_length: 8192,
              pricing: { prompt: "0", completion: "0" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models[0].isFree).toBe(true);
    });

    it("handles multiple models", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "openai/gpt-4",
              name: "GPT-4",
              description: "GPT-4",
              context_length: 8192,
              pricing: { prompt: "0.03", completion: "0.06" },
            },
            {
              id: "anthropic/claude-3-opus",
              name: "Claude 3 Opus",
              description: "Claude 3 Opus",
              context_length: 200000,
              pricing: { prompt: "0.015", completion: "0.075" },
            },
            {
              id: "meta-llama/llama-3-70b",
              name: "Llama 3 70B",
              description: "Llama 3 70B",
              context_length: 8192,
              pricing: { prompt: "0.001", completion: "0.001" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models).toHaveLength(3);
    });
  });

  describe("error handling", () => {
    it("handles non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain("Failed to fetch models");
      expect(result.current.models).toEqual([]);
    });

    it("handles network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe("Network failure");
      expect(result.current.models).toEqual([]);
    });

    it("handles unexpected response format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notData: "wrong format",
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toContain("Unexpected response format");
    });

    it("handles null data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: null,
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("context length handling", () => {
    it("formats valid context length", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "test/model",
              name: "Test Model",
              description: "Test",
              context_length: 128000,
              pricing: { prompt: "0.01", completion: "0.01" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models[0].contextLength).toBe(128000);
    });

    it("handles undefined context length", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "test/model",
              name: "Test Model",
              description: "Test",
              pricing: { prompt: "0.01", completion: "0.01" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models[0].contextLength).toBe(0);
    });

    it("handles negative context length", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "test/model",
              name: "Test Model",
              description: "Test",
              context_length: -1,
              pricing: { prompt: "0.01", completion: "0.01" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models[0].contextLength).toBe(0);
    });
  });

  describe("provider extraction", () => {
    it("extracts provider from model id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "google/gemini-pro",
              name: "Gemini Pro",
              description: "Google's Gemini Pro",
              context_length: 32000,
              pricing: { prompt: "0.001", completion: "0.002" },
            },
          ],
        }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.models[0].provider).toBe("google");
    });
  });
});
