import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranscriberToasts } from "./useTranscriberToasts";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    dismiss: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("useTranscriberToasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error toast when error is provided", () => {
    renderHook(() => useTranscriberToasts("ready", "Test error"));

    expect(toast.error).toHaveBeenCalledWith("Test error", { id: "stt-toast" });
  });

  it("shows loading toast when status is loading", () => {
    renderHook(() => useTranscriberToasts("loading", null));

    expect(toast.loading).toHaveBeenCalledWith("Loading speech model...", {
      id: "stt-toast",
    });
  });

  it("shows loading toast when status is processing", () => {
    renderHook(() => useTranscriberToasts("processing", null));

    expect(toast.loading).toHaveBeenCalledWith("Transcribing audio...", {
      id: "stt-toast",
    });
  });

  it("shows message toast when status is recording", () => {
    renderHook(() => useTranscriberToasts("recording", null));

    expect(toast.message).toHaveBeenCalledWith("Recording...", {
      description: "Click the mic icon to stop.",
      id: "stt-toast",
      icon: expect.anything(),
    });
  });

  it("dismisses toast when status is ready", () => {
    renderHook(() => useTranscriberToasts("ready", null));

    expect(toast.dismiss).toHaveBeenCalledWith("stt-toast");
  });

  it("dismisses toast when status is uninitialized", () => {
    renderHook(() => useTranscriberToasts("uninitialized", null));

    expect(toast.dismiss).toHaveBeenCalledWith("stt-toast");
  });

  it("dismisses toast when status is error but no error message", () => {
    renderHook(() => useTranscriberToasts("error", null));

    expect(toast.dismiss).toHaveBeenCalledWith("stt-toast");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("prioritizes error over status", () => {
    renderHook(() => useTranscriberToasts("loading", "Error message"));

    expect(toast.error).toHaveBeenCalledWith("Error message", {
      id: "stt-toast",
    });
    expect(toast.loading).not.toHaveBeenCalled();
  });
});
