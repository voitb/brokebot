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

  it("starts with editing disabled", () => {
    const { result } = renderHook(() =>
      useTitleEdit({
        conversationId: "conv-1",
        currentTitle: "Test Title",
        onSaveTitle: mockOnSaveTitle,
      })
    );

    expect(result.current.isEditingTitle).toBe(false);
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

    it("guards against missing conversationId or currentTitle", () => {
      // Missing conversationId
      const { result: noConvId } = renderHook(() =>
        useTitleEdit({
          conversationId: undefined,
          currentTitle: "Test Title",
          onSaveTitle: mockOnSaveTitle,
        })
      );
      act(() => noConvId.current.handleTitleClick());
      expect(noConvId.current.isEditingTitle).toBe(false);

      // Missing currentTitle
      const { result: noTitle } = renderHook(() =>
        useTitleEdit({
          conversationId: "conv-1",
          currentTitle: undefined,
          onSaveTitle: mockOnSaveTitle,
        })
      );
      act(() => noTitle.current.handleTitleClick());
      expect(noTitle.current.isEditingTitle).toBe(false);
    });
  });

  describe("handleSaveTitle", () => {
    it("saves trimmed title and exits edit mode", async () => {
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
        await result.current.handleSaveTitle("  Trimmed Title  ");
      });

      expect(mockOnSaveTitle).toHaveBeenCalledWith("conv-1", "Trimmed Title");
      expect(result.current.isEditingTitle).toBe(false);
    });

    it("skips save when title is unchanged", async () => {
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

    it("guards against missing conversationId", async () => {
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

    it("ignores rename event without conversation", () => {
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
