import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTitleEdit } from "./use-title-edit";

describe("useTitleEdit", () => {
  const mockOnSaveTitle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSaveTitle.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns isEditingTitle as false initially", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      expect(result.current.isEditingTitle).toBe(false);
    });
  });

  describe("handleTitleClick", () => {
    it("enables editing mode when conversation exists", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      expect(result.current.isEditingTitle).toBe(true);
    });

    it("does not enable editing when conversationId is undefined", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: undefined,
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      expect(result.current.isEditingTitle).toBe(false);
    });

    it("does not enable editing when currentTitle is undefined", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: undefined,
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      expect(result.current.isEditingTitle).toBe(false);
    });
  });

  describe("handleSaveTitle", () => {
    it("calls onSaveTitle and exits edit mode", async () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      await act(async () => {
        await result.current.handleSaveTitle("New Title");
      });

      expect(mockOnSaveTitle).toHaveBeenCalledWith("conv-1", "New Title");
      expect(result.current.isEditingTitle).toBe(false);
    });

    it("trims whitespace from title", async () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      await act(async () => {
        await result.current.handleSaveTitle("  Trimmed Title  ");
      });

      expect(mockOnSaveTitle).toHaveBeenCalledWith("conv-1", "Trimmed Title");
    });

    it("does not call onSaveTitle if title unchanged", async () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      await act(async () => {
        await result.current.handleSaveTitle("Test Title");
      });

      expect(mockOnSaveTitle).not.toHaveBeenCalled();
      expect(result.current.isEditingTitle).toBe(false);
    });

    it("does not call onSaveTitle without conversationId", async () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: undefined,
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      await act(async () => {
        await result.current.handleSaveTitle("New Title");
      });

      expect(mockOnSaveTitle).not.toHaveBeenCalled();
    });
  });

  describe("handleCancelTitleEdit", () => {
    it("exits edit mode", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        result.current.handleTitleClick();
      });

      expect(result.current.isEditingTitle).toBe(true);

      act(() => {
        result.current.handleCancelTitleEdit();
      });

      expect(result.current.isEditingTitle).toBe(false);
    });
  });

  describe("rename event listener", () => {
    it("enables editing when conversation:rename event is dispatched", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        document.dispatchEvent(new CustomEvent("conversation:rename"));
      });

      expect(result.current.isEditingTitle).toBe(true);
    });

    it("does not enable editing for rename event without conversation", () => {
      const { result } = renderHook(() =>
        useTitleEdit({
          conversationId: undefined,
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      act(() => {
        document.dispatchEvent(new CustomEvent("conversation:rename"));
      });

      expect(result.current.isEditingTitle).toBe(false);
    });

    it("cleans up event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "conversation:rename",
        expect.any(Function)
      );
    });
  });
});
