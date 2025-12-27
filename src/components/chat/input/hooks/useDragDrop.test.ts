import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragDrop } from "./useDragDrop";
import { createMockFile, createMockFileList, createMockDragEvent } from "../../../../test/mocks/modules";

describe("useDragDrop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with isDragOver false", () => {
      const { result } = renderHook(() => useDragDrop());

      expect(result.current.isDragOver).toBe(false);
    });

    it("provides all event handlers", () => {
      const { result } = renderHook(() => useDragDrop());

      expect(typeof result.current.handleDrop).toBe("function");
      expect(typeof result.current.handleDragOver).toBe("function");
      expect(typeof result.current.handleDragLeave).toBe("function");
      expect(typeof result.current.handleDragEnter).toBe("function");
    });
  });

  describe("handleDragEnter", () => {
    it("sets isDragOver to true when dragging files", () => {
      const { result } = renderHook(() => useDragDrop());

      const event = createMockDragEvent("dragenter", { types: ["Files"] });

      act(() => {
        result.current.handleDragEnter(event);
      });

      expect(result.current.isDragOver).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("does not set isDragOver when not dragging files", () => {
      const { result } = renderHook(() => useDragDrop());

      const event = createMockDragEvent("dragenter", { types: ["text/plain"] });

      act(() => {
        result.current.handleDragEnter(event);
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it("handles multiple drag enters", () => {
      const { result } = renderHook(() => useDragDrop());

      const event1 = createMockDragEvent("dragenter");
      const event2 = createMockDragEvent("dragenter");

      act(() => {
        result.current.handleDragEnter(event1);
        result.current.handleDragEnter(event2);
      });

      expect(result.current.isDragOver).toBe(true);
    });
  });

  describe("handleDragLeave", () => {
    it("sets isDragOver to false when counter reaches zero", () => {
      const { result } = renderHook(() => useDragDrop());

      const enterEvent = createMockDragEvent("dragenter");
      const leaveEvent = createMockDragEvent("dragleave");

      act(() => {
        result.current.handleDragEnter(enterEvent);
      });

      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDragLeave(leaveEvent);
      });

      expect(result.current.isDragOver).toBe(false);
      expect(leaveEvent.preventDefault).toHaveBeenCalled();
      expect(leaveEvent.stopPropagation).toHaveBeenCalled();
    });

    it("keeps isDragOver true when counter is still positive", () => {
      const { result } = renderHook(() => useDragDrop());

      const enterEvent1 = createMockDragEvent("dragenter");
      const enterEvent2 = createMockDragEvent("dragenter");
      const leaveEvent = createMockDragEvent("dragleave");

      act(() => {
        result.current.handleDragEnter(enterEvent1);
        result.current.handleDragEnter(enterEvent2);
        result.current.handleDragLeave(leaveEvent);
      });

      expect(result.current.isDragOver).toBe(true);
    });
  });

  describe("handleDragOver", () => {
    it("prevents default behavior", () => {
      const { result } = renderHook(() => useDragDrop());

      const event = createMockDragEvent("dragover");

      act(() => {
        result.current.handleDragOver(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe("handleDrop", () => {
    it("calls onFilesSelected with files", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      const file = createMockFile("test.txt");
      const fileList = createMockFileList([file]);

      const event = createMockDragEvent("drop") as unknown as React.DragEvent;
      Object.defineProperty(event.dataTransfer, "files", { value: fileList });

      act(() => {
        result.current.handleDrop(event, onFilesSelected);
      });

      expect(onFilesSelected).toHaveBeenCalledWith(fileList);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it("resets isDragOver on drop", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      const enterEvent = createMockDragEvent("dragenter");
      act(() => {
        result.current.handleDragEnter(enterEvent);
      });

      expect(result.current.isDragOver).toBe(true);

      const file = createMockFile("test.txt");
      const fileList = createMockFileList([file]);

      const dropEvent = createMockDragEvent("drop") as unknown as React.DragEvent;
      Object.defineProperty(dropEvent.dataTransfer, "files", { value: fileList });

      act(() => {
        result.current.handleDrop(dropEvent, onFilesSelected);
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it("resets drag counter on drop", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      const enterEvent1 = createMockDragEvent("dragenter");
      const enterEvent2 = createMockDragEvent("dragenter");
      act(() => {
        result.current.handleDragEnter(enterEvent1);
        result.current.handleDragEnter(enterEvent2);
      });

      const file = createMockFile("test.txt");
      const fileList = createMockFileList([file]);

      const dropEvent = createMockDragEvent("drop") as unknown as React.DragEvent;
      Object.defineProperty(dropEvent.dataTransfer, "files", { value: fileList });

      act(() => {
        result.current.handleDrop(dropEvent, onFilesSelected);
      });

      const leaveEvent = createMockDragEvent("dragleave");
      act(() => {
        result.current.handleDragLeave(leaveEvent);
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it("does not call onFilesSelected when no files", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      const emptyFileList = createMockFileList([]);

      const event = createMockDragEvent("drop") as unknown as React.DragEvent;
      Object.defineProperty(event.dataTransfer, "files", { value: emptyFileList });

      act(() => {
        result.current.handleDrop(event, onFilesSelected);
      });

      expect(onFilesSelected).not.toHaveBeenCalled();
    });

    it("handles multiple files", () => {
      const { result } = renderHook(() => useDragDrop());
      const onFilesSelected = vi.fn();

      const file1 = createMockFile("test1.txt");
      const file2 = createMockFile("test2.txt");
      const fileList = createMockFileList([file1, file2]);

      const event = createMockDragEvent("drop") as unknown as React.DragEvent;
      Object.defineProperty(event.dataTransfer, "files", { value: fileList });

      act(() => {
        result.current.handleDrop(event, onFilesSelected);
      });

      expect(onFilesSelected).toHaveBeenCalledTimes(1);
      expect(onFilesSelected).toHaveBeenCalledWith(fileList);
    });
  });

  describe("drag counter behavior", () => {
    it("handles nested drag enter/leave correctly", () => {
      const { result } = renderHook(() => useDragDrop());

      act(() => {
        result.current.handleDragEnter(createMockDragEvent("dragenter"));
      });
      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDragEnter(createMockDragEvent("dragenter"));
      });
      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDragLeave(createMockDragEvent("dragleave"));
      });
      expect(result.current.isDragOver).toBe(true);

      act(() => {
        result.current.handleDragLeave(createMockDragEvent("dragleave"));
      });
      expect(result.current.isDragOver).toBe(false);
    });
  });
});
