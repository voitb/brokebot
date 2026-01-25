import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragDrop } from "./use-drag-drop";
import {
  createMockFile,
  createMockFileList,
  createMockDragEvent,
} from "@/testing/mocks/modules";

function createDropEvent(files: File[]): React.DragEvent {
  const fileList = createMockFileList(files);
  const event = createMockDragEvent("drop") as unknown as React.DragEvent;
  Object.defineProperty(event.dataTransfer, "files", { value: fileList });
  return event;
}

describe("useDragDrop", () => {
  it("starts with isDragOver false", () => {
    const { result } = renderHook(() => useDragDrop());

    expect(result.current.isDragOver).toBe(false);
  });

  describe("drag enter/leave state", () => {
    it("sets isDragOver true when files are dragged in", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.handleDragEnter(
          createMockDragEvent("dragenter", { types: ["Files"] })
        );
      });

      expect(result.current.isDragOver).toBe(true);
    });

    it("ignores non-file drag events", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.handleDragEnter(
          createMockDragEvent("dragenter", { types: ["text/plain"] })
        );
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it("sets isDragOver false when drag leaves", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.handleDragEnter(createMockDragEvent("dragenter"));
      });
      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDragLeave(createMockDragEvent("dragleave"));
      });
      expect(result.current.isDragOver).toBe(false);
    });
  });

  describe("handleDrop", () => {
    it.each([
      { description: "single file", files: [createMockFile("doc.txt")] },
      {
        description: "multiple files",
        files: [createMockFile("a.txt"), createMockFile("b.txt")],
      },
    ])("calls onFilesSelected with $description", ({ files }) => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();
      const event = createDropEvent(files);

      act(() => {
        result.current.handleDrop(event, onFilesSelected);
      });

      expect(onFilesSelected).toHaveBeenCalledTimes(1);
    });

    it("does not call onFilesSelected when no files dropped", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();
      const event = createDropEvent([]);

      act(() => {
        result.current.handleDrop(event, onFilesSelected);
      });

      expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("resets isDragOver after drop", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      act(() => {
        result.current.handleDragEnter(createMockDragEvent("dragenter"));
      });
      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDrop(
          createDropEvent([createMockFile("test.txt")]),
          onFilesSelected
        );
      });
      expect(result.current.isDragOver).toBe(false);
    });
  });
});
