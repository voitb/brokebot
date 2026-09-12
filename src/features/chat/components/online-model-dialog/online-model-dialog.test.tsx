import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnlineModelDialog } from "./online-model-dialog";
import { useOnlineModels } from "./use-online-models";

vi.mock("./use-online-models");

function createMockHookReturn(overrides = {}) {
  return {
    storedKeys: { openrouter: "test-key" },
    freeModels: [],
    paidModels: [],
    hasOpenRouterKey: true,
    handleModelSelect: vi.fn(),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

describe("OnlineModelDialog", () => {
  const user = userEvent.setup();
  const mockOnModelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnlineModels).mockReturnValue(createMockHookReturn());
  });

  it("renders dialog with title and all tabs", () => {
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByRole("heading", { name: "Select Online AI Model" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /api keys/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /free models/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /paid models/i })).toBeInTheDocument();
  });

  it("disables model tabs when API keys missing", () => {
    vi.mocked(useOnlineModels).mockReturnValue(
      createMockHookReturn({ hasOpenRouterKey: false })
    );
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByRole("tab", { name: /free models/i })).toHaveAttribute("data-disabled");
    expect(screen.getByRole("tab", { name: /paid models/i })).toHaveAttribute("data-disabled");
  });

  it("shows loading state", async () => {
    vi.mocked(useOnlineModels).mockReturnValue(createMockHookReturn({ isLoading: true }));
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    await user.click(screen.getByRole("tab", { name: /free models/i }));

    expect(screen.getByText("Loading models...")).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.mocked(useOnlineModels).mockReturnValue(
      createMockHookReturn({ error: new Error("API Error") })
    );
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    await user.click(screen.getByRole("tab", { name: /free models/i }));

    expect(screen.getByText(/failed to load models/i)).toBeInTheDocument();
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });

  it("keeps the API keys tab available when the model fetch fails", () => {
    vi.mocked(useOnlineModels).mockReturnValue(
      createMockHookReturn({ error: new Error("API Error") })
    );
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByRole("tab", { name: /api keys/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/openrouter api key/i)).toBeInTheDocument();
  });

  it("does not advertise enhanced capabilities", async () => {
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    await user.click(screen.getByRole("tab", { name: /paid models/i }));

    expect(screen.queryByText(/enhanced capabilities/i)).toBeNull();
  });
});
