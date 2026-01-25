import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { CopyButton } from "./copy-button";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.stubGlobal("navigator", {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CopyButton", () => {
  it("renders with accessible label", () => {
    render(<CopyButton value="test content" />);

    expect(
      screen.getByRole("button", { name: "Copy to clipboard" })
    ).toBeInTheDocument();
  });

  it("copies to clipboard and shows copied state when clicked", async () => {
    const user = userEvent.setup();
    render(<CopyButton value="test content" />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });
  });

  it("shows tooltip on hover when enabled", async () => {
    const user = userEvent.setup();
    render(<CopyButton value="test" showTooltip />);

    await user.hover(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getAllByText("Copy to clipboard").length
      ).toBeGreaterThan(0);
    });
  });

  it("renders children when provided", () => {
    render(
      <CopyButton value="test">
        <span>Copy Code</span>
      </CopyButton>
    );

    expect(screen.getByText("Copy Code")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<CopyButton value="test" className="custom-class" />);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
