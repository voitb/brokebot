import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalRoot } from "./modal-root";
import { mockSearchParams, mockSetSearchParams } from "@/testing/mocks/modules";

describe("ModalRoot", () => {
  it("renders nothing when no modal is requested", () => {
    render(<ModalRoot />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing for a modal name that only exists on Object.prototype", () => {
    mockSearchParams.set("modal", "constructor");

    render(<ModalRoot />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the registered modal named in the URL", () => {
    mockSearchParams.set("modal", "shortcuts");

    render(<ModalRoot />);

    expect(
      screen.getByRole("dialog", { name: "Keyboard Shortcuts" }),
    ).toBeInTheDocument();
  });

  it("clears the modal params from the URL when the modal is closed", async () => {
    const user = userEvent.setup();
    mockSearchParams.set("modal", "shortcuts");
    mockSearchParams.set("conversationId", "conv-1");

    render(<ModalRoot />);
    await user.keyboard("{Escape}");

    const update = mockSetSearchParams.mock.calls[0][0];
    const next =
      typeof update === "function"
        ? update(new URLSearchParams(mockSearchParams))
        : update;
    expect([...next.keys()]).toEqual([]);
  });
});
