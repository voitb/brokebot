import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnlineModelDialog } from "./online-model-dialog";
import { useOnlineModels } from "./use-online-models";

vi.mock("./use-online-models");

function createMockHookReturn(overrides = {}) {
  return {
    storedKeys: { openrouter: "test-key" },
    freeModels: [],
    paidModels: [],
    hasOpenRouterKey: true,
    hasPaidKey: true,
    handleModelSelect: vi.fn(),
    handleOpenChange: vi.fn(),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

describe("OnlineModelDialog", () => {
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
      createMockHookReturn({ hasOpenRouterKey: false, hasPaidKey: false })
    );
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByRole("tab", { name: /free models/i })).toHaveAttribute("data-disabled");
    expect(screen.getByRole("tab", { name: /paid models/i })).toHaveAttribute("data-disabled");
  });

  it("shows loading state", () => {
    vi.mocked(useOnlineModels).mockReturnValue(createMockHookReturn({ isLoading: true }));
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByText("Loading models...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    vi.mocked(useOnlineModels).mockReturnValue(
      createMockHookReturn({ error: new Error("API Error") })
    );
    render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

    expect(screen.getByText(/failed to load models/i)).toBeInTheDocument();
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });
});
