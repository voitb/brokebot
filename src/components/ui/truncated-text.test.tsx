import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { TruncatedText } from "./truncated-text";

function mockOverflow(isOverflowing: boolean): void {
  const scrollWidth = isOverflowing ? 200 : 100;
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: 100,
  });
}

function mockHeightOverflow(isOverflowing: boolean): void {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: isOverflowing ? 200 : 100,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: 100,
  });
}

describe("TruncatedText", () => {
  beforeEach(() => {
    mockOverflow(false);
    mockHeightOverflow(false);
  });

  it("renders text content", () => {
    render(<TruncatedText>Hello World</TruncatedText>);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("shows the Tooltip on hover when the single-line text overflows", async () => {
    const user = userEvent.setup();
    mockOverflow(true);
    render(<TruncatedText>Very long single line</TruncatedText>);

    await user.hover(screen.getByText("Very long single line"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Very long single line");
  });

  it("shows Tooltip when scrollHeight exceeds clientHeight", async () => {
    const user = userEvent.setup();
    mockHeightOverflow(true);
    render(<TruncatedText maxLines={2}>Overflowing multi-line text</TruncatedText>);

    await user.hover(screen.getByText("Overflowing multi-line text"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Overflowing multi-line text",
    );
  });

  it("does not show a tooltip on hover when the text fits", async () => {
    const user = userEvent.setup();
    render(<TruncatedText>Short text</TruncatedText>);

    await user.hover(screen.getByText("Short text"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
