import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputDialog } from "./input-dialog";

describe("InputDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Test Dialog",
    description: "Enter your input",
    inputLabel: "Name",
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog with title, description, and input", () => {
    render(<InputDialog {...defaultProps} />);

    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Enter your input")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<InputDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
  });

  it("initializes with provided initial value", () => {
    render(<InputDialog {...defaultProps} initialValue="John Doe" />);

    expect(screen.getByPlaceholderText("Name")).toHaveValue("John Doe");
  });

  it("updates value when user types", async () => {
    const user = userEvent.setup();
    render(<InputDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText("Name");
    await user.type(input, "Alice");

    expect(input).toHaveValue("Alice");
  });

  it("disables confirm button when input is empty or whitespace", async () => {
    const user = userEvent.setup();
    render(<InputDialog {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByPlaceholderText("Name");
    await user.type(input, "   ");

    expect(confirmButton).toBeDisabled();
  });

  it("enables confirm button when input has content", async () => {
    const user = userEvent.setup();
    render(<InputDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("Name"), "Valid input");

    expect(screen.getByRole("button", { name: /confirm/i })).not.toBeDisabled();
  });

  it("calls onConfirm with trimmed value and closes dialog", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <InputDialog
        {...defaultProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    await user.type(screen.getByPlaceholderText("Name"), "  Test Value  ");
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledWith("Test Value");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("confirms on Enter key when value is valid", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<InputDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.type(screen.getByPlaceholderText("Name"), "Test{Enter}");

    expect(onConfirm).toHaveBeenCalledWith("Test");
  });

  it("does not confirm on Enter when input is empty", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<InputDialog {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText("Name");
    input.focus();
    await user.keyboard("{Enter}");

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes dialog without confirming when cancelled", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <InputDialog
        {...defaultProps}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    );

    await user.type(screen.getByPlaceholderText("Name"), "Some text");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses custom confirm text when provided", () => {
    render(<InputDialog {...defaultProps} confirmText="Save" />);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("focuses input on open", async () => {
    render(<InputDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Name")).toHaveFocus();
    });
  });

  it("resets to new initial value when dialog reopens", () => {
    const { rerender } = render(
      <InputDialog {...defaultProps} open={false} initialValue="First" />
    );

    rerender(
      <InputDialog {...defaultProps} open={true} initialValue="Second" />
    );

    expect(screen.getByPlaceholderText("Name")).toHaveValue("Second");
  });
});
