import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnlineModelDialog } from "./online-model-dialog";
import { createMockOpenRouterModel } from "@/testing/mocks/modules";

const mockFreeModels = [
  createMockOpenRouterModel({ id: "free-1", name: "Free Model 1", isFree: true }),
  createMockOpenRouterModel({ id: "free-2", name: "Free Model 2", isFree: true }),
];

const mockPaidModels = [
  createMockOpenRouterModel({ id: "paid-1", name: "Paid Model 1", isFree: false }),
  createMockOpenRouterModel({ id: "paid-2", name: "Paid Model 2", isFree: false }),
];

let mockHookReturn = {
  storedKeys: { openrouter: "test-key" },
  hasOpenRouterKey: true,
  hasPaidKey: true,
  handleModelSelect: vi.fn(),
  handleOpenChange: vi.fn(),
  freeModels: mockFreeModels,
  paidModels: mockPaidModels,
  isLoading: false,
  error: null as Error | null,
};

vi.mock("./use-online-models", () => ({
  useOnlineModels: () => mockHookReturn,
}));

describe("OnlineModelDialog", () => {
  const mockOnModelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHookReturn = {
      storedKeys: { openrouter: "test-key" },
      hasOpenRouterKey: true,
      hasPaidKey: true,
      handleModelSelect: vi.fn(),
      handleOpenChange: vi.fn(),
      freeModels: mockFreeModels,
      paidModels: mockPaidModels,
      isLoading: false,
      error: null,
    };
  });

  describe("Paid Models Tab", () => {
    it("renders paid tab trigger", () => {
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      const paidTab = screen.getByRole("tab", { name: /paid models/i });
      expect(paidTab).toBeInTheDocument();
    });

    it("disables paid tab when no API key", () => {
      mockHookReturn = { ...mockHookReturn, hasPaidKey: false };
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      const paidTab = screen.getByRole("tab", { name: /paid models/i });
      expect(paidTab).toHaveAttribute("data-disabled");
    });

    it("enables paid tab when API key exists", () => {
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      const paidTab = screen.getByRole("tab", { name: /paid models/i });
      expect(paidTab).not.toHaveAttribute("data-disabled");
    });
  });

  describe("Free Models Tab", () => {
    it("renders free tab trigger", () => {
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      const freeTab = screen.getByRole("tab", { name: /free models/i });
      expect(freeTab).toBeInTheDocument();
    });

    it("disables free tab when no API key", () => {
      mockHookReturn = { ...mockHookReturn, hasOpenRouterKey: false };
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      const freeTab = screen.getByRole("tab", { name: /free models/i });
      expect(freeTab).toHaveAttribute("data-disabled");
    });
  });

  describe("Loading and Error States", () => {
    it("shows loading state", () => {
      mockHookReturn = { ...mockHookReturn, isLoading: true };
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      expect(screen.getByText("Loading models...")).toBeInTheDocument();
    });

    it("shows error state", () => {
      mockHookReturn = { ...mockHookReturn, error: new Error("API Error") };
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      expect(screen.getByText(/failed to load models/i)).toBeInTheDocument();
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  describe("Dialog Structure", () => {
    it("renders dialog with correct title", () => {
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      expect(screen.getByText("Select Online AI Model")).toBeInTheDocument();
    });

    it("renders all three tabs", () => {
      render(<OnlineModelDialog onModelSelect={mockOnModelSelect} open={true} />);

      expect(screen.getByRole("tab", { name: /api keys/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /free models/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /paid models/i })).toBeInTheDocument();
    });
  });
});
