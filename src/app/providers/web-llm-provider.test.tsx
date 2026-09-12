import { useEffect } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockToast } from "@/testing/mocks/modules";
import { WebLLMProvider, useWebLLM } from "./web-llm-provider";

const catalogRef = { shouldThrow: true };
const createEngine = vi.hoisted(() => vi.fn());

vi.mock("@mlc-ai/web-llm", () => ({
  get prebuiltAppConfig() {
    if (catalogRef.shouldThrow) throw new Error("catalog failed");
    return {
      model_list: [
        {
          model_id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
          vram_required_MB: 1500,
        },
      ],
    };
  },
  ModelType: {},
  CreateWebWorkerMLCEngine: createEngine,
}));

vi.stubGlobal(
  "Worker",
  class {
    terminate = vi.fn();
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
  },
);

function StatusProbe() {
  const { status } = useWebLLM();
  return <div>{status}</div>;
}

function ModelSwitchProbe() {
  const { loadModel } = useWebLLM();
  return (
    <button onClick={() => loadModel("Llama-3.2-1B-Instruct-q4f16_1-MLC")}>
      pick another model
    </button>
  );
}

function UnloadWhileCatalogLoadsProbe() {
  const { unloadEngine } = useWebLLM();
  useEffect(() => {
    Promise.resolve().then(unloadEngine);
  }, []);
  return null;
}

function CatalogProbe() {
  const { availableModels } = useWebLLM();
  return <div>models: {availableModels.length}</div>;
}

describe("WebLLMProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    catalogRef.shouldThrow = true;
    createEngine.mockReset();
    mockToast.error.mockClear();
  });

  it("toasts when the model catalog fails to load", async () => {
    render(
      <WebLLMProvider>
        <StatusProbe />
      </WebLLMProvider>,
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to initialize local models.",
        expect.objectContaining({
          description: expect.stringContaining("catalog failed"),
        }),
      );
    });
  });

  it("toasts when the default local model fails to load", async () => {
    catalogRef.shouldThrow = false;
    createEngine.mockRejectedValue(new Error("engine boom"));

    render(
      <WebLLMProvider>
        <StatusProbe />
      </WebLLMProvider>,
    );

    await waitFor(() => {
      expect(createEngine).toHaveBeenCalledWith(
        expect.anything(),
        "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        expect.anything(),
      );
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to load the local model.",
        expect.objectContaining({
          description: expect.stringContaining("engine boom"),
        }),
      );
    });
  });

  it("releases an engine whose load was superseded by another model", async () => {
    catalogRef.shouldThrow = false;
    const unload = vi.fn().mockResolvedValue(undefined);
    let finishSupersededLoad: (engine: { unload: typeof unload }) => void =
      () => {};
    createEngine
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishSupersededLoad = resolve;
          }),
      )
      .mockResolvedValue({ unload: vi.fn().mockResolvedValue(undefined) });

    render(
      <WebLLMProvider>
        <ModelSwitchProbe />
      </WebLLMProvider>,
    );

    await waitFor(() => expect(createEngine).toHaveBeenCalledTimes(1));
    const supersededWorker = createEngine.mock.calls[0][0];

    await userEvent.click(
      screen.getByRole("button", { name: /pick another model/i }),
    );
    await waitFor(() => expect(createEngine).toHaveBeenCalledTimes(2));

    await act(async () => {
      finishSupersededLoad({ unload });
    });

    await waitFor(() => {
      expect(unload).toHaveBeenCalled();
      expect(supersededWorker.terminate).toHaveBeenCalled();
    });
  });

  it("does not auto-load the default local model when the engine is unloaded while the catalog is still loading", async () => {
    catalogRef.shouldThrow = false;

    await act(async () => {
      render(
        <WebLLMProvider>
          <UnloadWhileCatalogLoadsProbe />
          <CatalogProbe />
        </WebLLMProvider>,
      );
    });

    await waitFor(() =>
      expect(screen.getByText("models: 1")).toBeInTheDocument(),
    );
    expect(createEngine).not.toHaveBeenCalled();
  });
});
