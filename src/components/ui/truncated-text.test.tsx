import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
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

describe("TruncatedText", () => {
  beforeEach(() => {
    mockOverflow(false);
  });

  it("renders text content", () => {
    render(<TruncatedText>Hello World</TruncatedText>);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("does not wrap in tooltip when text fits", () => {
    mockOverflow(false);
    render(<TruncatedText>Short text</TruncatedText>);

    expect(screen.getByText("Short text")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("wraps in tooltip when text is truncated", () => {
    mockOverflow(true);
    render(<TruncatedText>Very long text that should be truncated</TruncatedText>);

    expect(screen.getByText("Very long text that should be truncated")).toBeInTheDocument();
  });
});
