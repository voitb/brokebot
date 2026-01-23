import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInputKeyboardShortcuts } from "./use-input-keyboard-shortcuts";

describe("useInputKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onMicToggle when Alt+M is pressed", () => {
    const onMicToggle = vi.fn();
    renderHook(() => useInputKeyboardShortcuts(onMicToggle));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "m",
        altKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onMicToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onMicToggle for regular M key without Alt", () => {
    const onMicToggle = vi.fn();
    renderHook(() => useInputKeyboardShortcuts(onMicToggle));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "m",
        altKey: false,
      });
      window.dispatchEvent(event);
    });

    expect(onMicToggle).not.toHaveBeenCalled();
  });

  it("does not call onMicToggle for Alt+other key", () => {
    const onMicToggle = vi.fn();
    renderHook(() => useInputKeyboardShortcuts(onMicToggle));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "k",
        altKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onMicToggle).not.toHaveBeenCalled();
  });

  it("prevents default behavior on Alt+M", () => {
    const onMicToggle = vi.fn();
    renderHook(() => useInputKeyboardShortcuts(onMicToggle));

    const event = new KeyboardEvent("keydown", {
      key: "m",
      altKey: true,
      cancelable: true,
    });

    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const onMicToggle = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useInputKeyboardShortcuts(onMicToggle)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("handles uppercase M key", () => {
    const onMicToggle = vi.fn();
    renderHook(() => useInputKeyboardShortcuts(onMicToggle));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "M",
        altKey: true,
      });
      window.dispatchEvent(event);
    });

    // Uppercase M should not trigger (we check for lowercase 'm')
    expect(onMicToggle).not.toHaveBeenCalled();
  });
});
