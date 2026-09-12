import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { OnboardingDialog } from "./onboarding-dialog";

const SCROLL_HEIGHT = 800;
const CLIENT_HEIGHT = 200;
const BOTTOM_SCROLL_TOP = SCROLL_HEIGHT - CLIENT_HEIGHT;

function stubOverflowingViewport(): void {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: SCROLL_HEIGHT,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: CLIENT_HEIGHT,
  });
}

function getViewport(): HTMLDivElement {
  const viewport = screen
    .getByRole("dialog")
    .querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]');

  if (!viewport) {
    throw new Error("Scroll area viewport not found");
  }

  return viewport;
}

describe("OnboardingDialog", () => {
  beforeEach(() => {
    stubOverflowingViewport();
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
    Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  });

  it("keeps Continue disabled while the content overflows", () => {
    render(<OnboardingDialog isOpen onClose={vi.fn()} />);

    expect(
      screen.getByText("Please scroll to the bottom to continue.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i understand & continue/i })
    ).toBeDisabled();
  });

  it("enables Continue after scrolling to the bottom", () => {
    render(<OnboardingDialog isOpen onClose={vi.fn()} />);

    const viewport = getViewport();
    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      writable: true,
      value: BOTTOM_SCROLL_TOP,
    });

    fireEvent.scroll(viewport, { bubbles: true });

    expect(
      screen.getByRole("button", { name: /i understand & continue/i })
    ).not.toBeDisabled();
    expect(
      screen.queryByText("Please scroll to the bottom to continue.")
    ).not.toBeInTheDocument();
  });
});
