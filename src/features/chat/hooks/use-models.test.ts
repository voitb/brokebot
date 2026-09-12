import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useModels } from "./use-models";
import { setupFetchMock } from "@/testing/mocks/modules";

const { mockFetch } = setupFetchMock();

function createApiModel(
  overrides: Partial<{
    id: string;
    name: string;
    description: string;
    context_length: number;
    pricing: { prompt: string; completion: string };
  }> = {}
) {
  return {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "A small model",
    context_length: 128000,
    pricing: { prompt: "0.00015", completion: "0.0006" },
    architecture: { modality: "text->text" },
    ...overrides,
  };
}

describe("useModels", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns loading state initially then models after fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: "anthropic/claude-3", name: "Claude 3", description: "Test", context_length: 200000, pricing: { prompt: "0.015", completion: "0.075" } },
          { id: "google/gemma:free", name: "Gemma Free", description: "Test", context_length: 8192, pricing: { prompt: "0", completion: "0" } },
        ],
      }),
    });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.models).toHaveLength(2);
    expect(result.current.models[0]).toMatchObject({
      id: "anthropic/claude-3",
      provider: "anthropic",
      isFree: false,
      contextLength: 200000,
    });
    expect(result.current.models[1].isFree).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("defaults contextLength to 0 for missing or invalid values", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: "test/a", name: "A", description: "", pricing: { prompt: "0", completion: "0" } },
          { id: "test/b", name: "B", description: "", context_length: -1, pricing: { prompt: "0", completion: "0" } },
        ],
      }),
    });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.models[0].contextLength).toBe(0);
    expect(result.current.models[1].contextLength).toBe(0);
  });

  it("maps a valid catalog payload and ignores unknown wire fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [createApiModel()], extra: "ignored" }),
    });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.models).toEqual([
      {
        id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "A small model",
        contextLength: 128000,
        pricing: { prompt: "0.00015", completion: "0.0006" },
        provider: "openai",
        isFree: false,
        category: "reasoning",
      },
    ]);
  });

  it("skips a model entry that violates the schema and maps the rest", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          createApiModel(),
          { ...createApiModel({ id: "broken/model" }), pricing: { prompt: 0.5, completion: "0.001" } },
        ],
      }),
    });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.models.map((model) => model.id)).toEqual(["openai/gpt-4o-mini"]);
  });

  it("reports an error when every model entry violates the schema", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { ...createApiModel(), pricing: { prompt: 0.5, completion: "0.001" } },
          { ...createApiModel({ id: "other/model" }), pricing: { prompt: "0.1", completion: 2 } },
        ],
      }),
    });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toContain("Unexpected response format");
    expect(result.current.models).toEqual([]);
  });

  it("reports no error for an empty catalog", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.models).toEqual([]);
  });

  it("handles API error response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: "Server Error" });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toContain("Failed to fetch models");
    expect(result.current.models).toEqual([]);
  });

  it("handles invalid response format", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) });

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toContain("Unexpected response format");
  });

  it("handles network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useModels({ apiKey: "test-key" }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toBe("Network failure");
    expect(result.current.models).toEqual([]);
  });

  it("does not fetch when no apiKey is provided", () => {
    const { result } = renderHook(() => useModels());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
