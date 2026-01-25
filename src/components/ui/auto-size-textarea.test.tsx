import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutosizeTextarea } from "./auto-size-textarea";

describe("AutosizeTextarea", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea element", () => {
    render(<AutosizeTextarea />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("passes through standard textarea props", () => {
    render(
      <AutosizeTextarea
        placeholder="Enter text"
        disabled
        className="custom-class"
      />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder", "Enter text");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass("custom-class");
  });

  it("handles controlled value", () => {
    const { rerender } = render(
      <AutosizeTextarea value="Initial" onChange={vi.fn()} />
    );

    expect(screen.getByRole("textbox")).toHaveValue("Initial");

    rerender(<AutosizeTextarea value="Updated" onChange={vi.fn()} />);

    expect(screen.getByRole("textbox")).toHaveValue("Updated");
  });

  it("calls onChange handler when typing", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<AutosizeTextarea onChange={handleChange} />);

    await user.type(screen.getByRole("textbox"), "Hello");

    expect(handleChange).toHaveBeenCalledTimes(5);
  });

  it("handles multiline text input", async () => {
    const user = userEvent.setup();

    render(<AutosizeTextarea />);

    await user.type(
      screen.getByRole("textbox"),
      "Line 1{Enter}Line 2{Enter}Line 3"
    );

    expect(screen.getByRole("textbox")).toHaveValue("Line 1\nLine 2\nLine 3");
  });

  it("respects defaultValue prop", () => {
    render(<AutosizeTextarea defaultValue="Default text" />);

    expect(screen.getByRole("textbox")).toHaveValue("Default text");
  });
});
