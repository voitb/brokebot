import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { ModelList } from "./model-list";
import { createMockOpenRouterModel } from "@/testing/mocks/modules";

const mockModels = [
  createMockOpenRouterModel({
    id: "openai/gpt-4",
    name: "GPT-4",
    isFree: false,
    description: "Advanced reasoning model",
    provider: "openai",
  }),
  createMockOpenRouterModel({
    id: "anthropic/claude-3",
    name: "Claude 3",
    isFree: false,
    description: "Helpful AI assistant",
    provider: "anthropic",
  }),
  createMockOpenRouterModel({
    id: "google/gemini",
    name: "Gemini Pro",
    isFree: true,
    description: "Multimodal capabilities",
    provider: "google",
  }),
];

describe("ModelList", () => {
  const user = userEvent.setup();
  const mockOnSelect = vi.fn();

  const defaultProps = {
    models: mockModels,
    onSelect: mockOnSelect,
    isFree: false,
    availableKeys: { openrouter: "test-api-key" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("renders search input", () => {
      render(<ModelList {...defaultProps} />);

      expect(
        screen.getByPlaceholderText("Search models...")
      ).toBeInTheDocument();
    });

    it("filters models by name", async () => {
      render(<ModelList {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Search models..."), "claude");

      expect(screen.queryByText("GPT-4")).not.toBeInTheDocument();
      expect(screen.getByText("Claude 3")).toBeInTheDocument();
      expect(screen.queryByText("Gemini Pro")).not.toBeInTheDocument();
    });

    it("filters by provider name", async () => {
      render(<ModelList {...defaultProps} />);

      await user.type(screen.getByPlaceholderText("Search models..."), "google");

      expect(screen.queryByText("GPT-4")).not.toBeInTheDocument();
      expect(screen.queryByText("Claude 3")).not.toBeInTheDocument();
      expect(screen.getByText("Gemini Pro")).toBeInTheDocument();
    });

    it("shows empty state when no matches", async () => {
      render(<ModelList {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText("Search models..."),
        "nonexistent"
      );

      expect(screen.getByText(/no models found matching/i)).toBeInTheDocument();
    });
  });

  describe("model display", () => {
    it("renders all models", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude 3")).toBeInTheDocument();
      expect(screen.getByText("Gemini Pro")).toBeInTheDocument();
    });

    it("does not show empty message when models exist", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.queryByText(/no models found/i)).not.toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("calls onSelect when model is clicked", async () => {
      render(<ModelList {...defaultProps} />);

      const gpt4Card = screen.getByText("GPT-4").closest("[data-slot='card']");
      await user.click(gpt4Card!);

      expect(mockOnSelect).toHaveBeenCalledWith(mockModels[0]);
    });

    it("does not call onSelect when disabled", async () => {
      render(<ModelList {...defaultProps} availableKeys={{}} />);

      const gpt4Card = screen.getByText("GPT-4").closest("[data-slot='card']");
      await user.click(gpt4Card!);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });
});
