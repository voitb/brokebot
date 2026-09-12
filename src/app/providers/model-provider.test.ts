import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { StreamResponse } from "@/features/chat/api/openrouter";
import { setupFetchMock, mockToast } from "@/testing/mocks/modules";
import {
  createMockLocalModel,
  createMockOpenRouterModel,
} from "@/testing/mocks/factories";
import {
  ModelProvider,
  useModel,
  createLocalModel,
  createOnlineModel,
  type ModelProviderState,
} from "./model-provider";
import { WebLLMProvider } from "./web-llm-provider";

const VALID_KEY = "sk-or-v1-test-key-12345678901234567890";

const keyRef: { value: string } = { value: VALID_KEY };

vi.mock("@/hooks/use-user-config", () => ({
  useUserConfig: () => ({
    config: {
      id: "user_config",
      username: "User",
      theme: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
      openrouterApiKey: keyRef.value,
    },
    updateConfig: vi.fn(),
    resetConfig: vi.fn(),
  }),
}));

const createEngine = vi.hoisted(() => vi.fn());

const catalogRef = vi.hoisted(() => ({
  models: [] as ReturnType<typeof createMockLocalModel>[],
}));

vi.mock("@/features/chat/api/webllm", () => ({
  loadModelCatalog: () => Promise.resolve(catalogRef.models),
}));

vi.mock("@mlc-ai/web-llm", () => ({
  CreateWebWorkerMLCEngine: createEngine,
  prebuiltAppConfig: { model_list: [] },
  ModelType: { LLM: 0, VLM: 1, embedding: 2 },
}));

vi.stubGlobal(
  "Worker",
  class {
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
  },
);

const { mockFetch } = setupFetchMock();

const createOnline = () =>
  createOnlineModel(
    createMockOpenRouterModel({
      id: "openai/gpt-4",
      name: "GPT-4",
      isFree: false,
    }),
    VALID_KEY,
  );

function wrapper({ children }: { children: ReactNode }) {
  return createElement(
    WebLLMProvider,
    null,
    createElement(ModelProvider, null, children),
  );
}

async function loadLocalModel(
  result: { current: ModelProviderState },
  unload: Mock,
) {
  let finishLoad: (engine: { unload: Mock }) => void = () => {};
  createEngine.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishLoad = resolve;
      }),
  );

  await act(async () => {
    result.current.setCurrentModel(createLocalModel(createMockLocalModel()));
  });
  await waitFor(() => expect(createEngine).toHaveBeenCalled());
  await act(async () => {
    finishLoad({ unload });
  });
}

describe("ModelProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    keyRef.value = VALID_KEY;
    catalogRef.models = [];
    mockFetch.mockClear();
    mockToast.error.mockClear();
    createEngine.mockReset();
  });

  it("does not send after the OpenRouter key is removed", async () => {
    const { result, rerender } = renderHook(() => useModel(), { wrapper });

    const online = createOnline();

    await act(async () => {
      result.current.setCurrentModel(online);
    });

    await waitFor(() => {
      expect(result.current.currentModel).toEqual(online);
    });

    keyRef.value = "";
    rerender();

    await waitFor(() => {
      expect(result.current.currentModel).toBeNull();
    });

    mockFetch.mockClear();

    const chunks: StreamResponse[] = [];
    for await (const chunk of result.current.streamMessage([
      { role: "user", content: "Hi" },
    ])) {
      chunks.push(chunk);
    }

    expect(mockFetch).not.toHaveBeenCalled();
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.error).toBe("No model selected");
  });

  it("leaves no model selected when the key is removed after switching online", async () => {
    const unload = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(() => useModel(), { wrapper });

    await loadLocalModel(result, unload);

    await act(async () => {
      result.current.setCurrentModel(createOnline());
    });

    await waitFor(() => {
      expect(unload).toHaveBeenCalled();
    });

    keyRef.value = "";
    rerender();

    await waitFor(() => {
      expect(result.current.currentModel).toBeNull();
      expect(localStorage.getItem("unifiedModel")).toBeNull();
    });
  });

  it("falls back to the default local model when the OpenRouter key is removed", async () => {
    catalogRef.models = [createMockLocalModel()];
    createEngine.mockResolvedValue({
      unload: vi.fn().mockResolvedValue(undefined),
    });

    const { result, rerender } = renderHook(() => useModel(), { wrapper });

    await act(async () => {
      result.current.setCurrentModel(createOnline());
    });

    await waitFor(() => {
      expect(result.current.currentModel?.type).toBe("online");
    });

    keyRef.value = "";
    rerender();

    await waitFor(() => {
      expect(result.current.currentModel).toEqual(
        createLocalModel(createMockLocalModel()),
      );
    });
    expect(result.current.modelStatus).toBe("Ready");
  });

  it("reports a local model that fails to unload on the switch to online", async () => {
    const { result } = renderHook(() => useModel(), { wrapper });

    await loadLocalModel(result, vi.fn().mockRejectedValue(new Error("boom")));

    await act(async () => {
      result.current.setCurrentModel(createOnline());
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to unload the local model.",
      );
    });
  });
});
