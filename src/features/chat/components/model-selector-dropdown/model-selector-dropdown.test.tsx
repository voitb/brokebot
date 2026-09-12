import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { WebLLMProvider } from "@/app/providers/web-llm-provider";
import { ModelProvider } from "@/app/providers/model-provider";
import { loadModelCatalog } from "@/features/chat/api/webllm";
import { createMockLocalModel, createMockModel } from "@/testing/mocks/factories";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { encryptValue } from "@/lib/encryption-service";
import { ModelSelectorDropdown } from "./model-selector-dropdown";

vi.mock("@/features/chat/api/webllm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/chat/api/webllm")>();
  return {
    ...actual,
    loadModelCatalog: vi.fn(),
  };
});

vi.mock("@mlc-ai/web-llm", () => ({
  CreateWebWorkerMLCEngine: vi.fn(),
  prebuiltAppConfig: { model_list: [] },
}));

function renderDropdown() {
  return render(
    <WebLLMProvider>
      <ModelProvider>
        <ModelSelectorDropdown />
      </ModelProvider>
    </WebLLMProvider>
  );
}

async function openDropdown() {
  renderDropdown();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /select model/i }));
}

describe("ModelSelectorDropdown", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.userConfig.clear();
    localStorage.setItem("unifiedModel", JSON.stringify(createMockModel("online")));
    vi.mocked(loadModelCatalog).mockResolvedValue([createMockLocalModel()]);
  });

  it("shows local model names from the catalog when the dropdown opens", async () => {
    await openDropdown();

    expect(await screen.findByText("Llama 3.2 1B")).toBeInTheDocument();
    expect(screen.queryByText(/Download:/)).not.toBeInTheDocument();
  });

  it("shows the API key required badge when no key is stored", async () => {
    await openDropdown();

    expect(screen.getByText("API Key Required")).toBeInTheDocument();
  });

  it("shows the API ready badge when a key is stored", async () => {
    await db.userConfig.put({
      ...DEFAULT_USER_CONFIG,
      openrouterApiKey: await encryptValue("sk-or-v1-test"),
    });

    await openDropdown();

    expect(await screen.findByText("API Ready")).toBeInTheDocument();
    expect(screen.queryByText("API Key Required")).not.toBeInTheDocument();
  });
});
