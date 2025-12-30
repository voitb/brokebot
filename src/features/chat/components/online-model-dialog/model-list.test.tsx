import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import { ModelList } from "./model-list";
import { createMockOpenRouterModel } from "@/test/mocks/modules";

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

  describe("Search Input", () => {
    it("renders search input with placeholder", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.getByPlaceholderText("Search models...")).toBeInTheDocument();
    });

    it("updates search value on typing", async () => {
      render(<ModelList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Search models...");
      await user.type(searchInput, "GPT");

      expect(searchInput).toHaveValue("GPT");
    });
  });

  describe("Filtering", () => {
    it("shows all models when search is empty", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude 3")).toBeInTheDocument();
      expect(screen.getByText("Gemini Pro")).toBeInTheDocument();
    });

    it("filters models by search query", async () => {
      render(<ModelList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Search models...");
      await user.type(searchInput, "claude");

      expect(screen.queryByText("GPT-4")).not.toBeInTheDocument();
      expect(screen.getByText("Claude 3")).toBeInTheDocument();
      expect(screen.queryByText("Gemini Pro")).not.toBeInTheDocument();
    });

    it("filters by provider name", async () => {
      render(<ModelList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Search models...");
      await user.type(searchInput, "google");

      expect(screen.queryByText("GPT-4")).not.toBeInTheDocument();
      expect(screen.queryByText("Claude 3")).not.toBeInTheDocument();
      expect(screen.getByText("Gemini Pro")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("shows no-results message when search has no matches", async () => {
      render(<ModelList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Search models...");
      await user.type(searchInput, "nonexistent");

      expect(screen.getByText(/no models found matching/i)).toBeInTheDocument();
      expect(screen.getByText(/"nonexistent"/)).toBeInTheDocument();
    });

    it("does not show empty message on initial render", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.queryByText(/no models found/i)).not.toBeInTheDocument();
    });

    it("does not show empty message when models exist with empty search", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.queryByText(/no models found/i)).not.toBeInTheDocument();
      expect(screen.getByText("GPT-4")).toBeInTheDocument();
    });
  });

  describe("Model Cards", () => {
    it("renders a card for each model", () => {
      render(<ModelList {...defaultProps} />);

      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(screen.getByText("Claude 3")).toBeInTheDocument();
      expect(screen.getByText("Gemini Pro")).toBeInTheDocument();
    });

    it("marks selected model with ring", () => {
      const selectedModel = mockModels[1];
      render(<ModelList {...defaultProps} selectedModel={selectedModel} />);

      const claudeCard = screen.getByText("Claude 3").closest("[data-slot='card']");
      expect(claudeCard).toHaveClass("ring-2");
    });

    it("does not mark unselected models with ring", () => {
      const selectedModel = mockModels[1];
      render(<ModelList {...defaultProps} selectedModel={selectedModel} />);

      const gptCard = screen.getByText("GPT-4").closest("[data-slot='card']");
      expect(gptCard).not.toHaveClass("ring-2");
    });
  });

  describe("Selection", () => {
    it("calls onSelect when model card is clicked", async () => {
      render(<ModelList {...defaultProps} />);

      const gpt4Card = screen.getByText("GPT-4").closest("[data-slot='card']");
      await user.click(gpt4Card!);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockModels[0]);
    });
  });

  describe("Enable/Disable State", () => {
    it("enables cards when openrouter key exists", () => {
      render(<ModelList {...defaultProps} />);

      const gptCard = screen.getByText("GPT-4").closest("[data-slot='card']");
      expect(gptCard).toHaveClass("cursor-pointer");
      expect(gptCard).not.toHaveClass("opacity-50");
    });

    it("disables cards when no openrouter key", () => {
      render(<ModelList {...defaultProps} availableKeys={{}} />);

      const gptCard = screen.getByText("GPT-4").closest("[data-slot='card']");
      expect(gptCard).toHaveClass("cursor-not-allowed");
      expect(gptCard).toHaveClass("opacity-50");
    });

    it("does not call onSelect when disabled card is clicked", async () => {
      render(<ModelList {...defaultProps} availableKeys={{}} />);

      const gpt4Card = screen.getByText("GPT-4").closest("[data-slot='card']");
      await user.click(gpt4Card!);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });
});
