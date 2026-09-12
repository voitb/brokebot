import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "./use-file-upload";
import type { Document } from "@/lib/db";
import {
  mockToast,
  createMockFile,
  createMockFileList,
  createMockDocument,
} from "@/testing/mocks/modules";

function renderFileUpload(persistToLibrary?: (file: File) => Promise<Document | null>) {
  return renderHook(() =>
    useFileUpload({ selectedModelName: "GPT-4", persistToLibrary })
  );
}

describe("useFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches text files without writing to the document library", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("test.txt", "content")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].content).toBe("content");
  });

  it("persists to the library only when a callback is passed", async () => {
    const persistToLibrary = vi.fn(async () => createMockDocument());
    const { result } = renderFileUpload(persistToLibrary);
    const file = createMockFile("test.txt", "content");

    await act(async () => {
      await result.current.handleFilesSelected(createMockFileList([file]));
    });

    expect(persistToLibrary).toHaveBeenCalledTimes(1);
    expect(persistToLibrary).toHaveBeenCalledWith(file);

    const { result: librarylessUpload } = renderFileUpload();

    await act(async () => {
      await librarylessUpload.current.handleFilesSelected(
        createMockFileList([createMockFile("test.txt", "content")])
      );
    });

    expect(persistToLibrary).toHaveBeenCalledTimes(1);
  });

  it("appends on a second selection instead of replacing", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("first.txt", "one")])
      );
    });

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("second.txt", "two")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(2);
    expect(result.current.attachedFiles.map((attached) => attached.file.name)).toEqual([
      "first.txt",
      "second.txt",
    ]);
  });

  it("rejects unsupported file types", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("paper.pdf", "%PDF", "application/pdf")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(0);
    expect(mockToast.error).toHaveBeenCalled();
  });

  it("rejects images", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("image.png", "data", "image/png")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(0);
    expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining("not supported"));
  });

  it("enforces file size limit", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("big.txt", "x", "text/plain", 11 * 1024 * 1024)])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(0);
    expect(mockToast.error).toHaveBeenCalled();
  });

  it("does not attach a file whose read fails", async () => {
    const { result } = renderFileUpload();
    const file = createMockFile("broken.txt", "content");
    vi.spyOn(file, "text").mockRejectedValue(new Error("read failed"));

    await act(async () => {
      await result.current.handleFilesSelected(createMockFileList([file]));
    });

    expect(result.current.attachedFiles).toHaveLength(0);
    expect(mockToast.error).toHaveBeenCalledWith("Failed to read broken.txt");
  });

  it("removes and clears files", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([
          createMockFile("test1.txt", "Content 1"),
          createMockFile("test2.txt", "Content 2"),
        ])
      );
    });
    expect(result.current.attachedFiles).toHaveLength(2);

    const fileId = result.current.attachedFiles[0].id;
    act(() => result.current.removeFile(fileId));
    expect(result.current.attachedFiles).toHaveLength(1);

    act(() => result.current.clearFiles());
    expect(result.current.attachedFiles).toHaveLength(0);
  });
});
