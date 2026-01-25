import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload, type AttachedFile } from "./use-file-upload";
import { mockToast, createMockFile, createMockFileList } from "@/testing/mocks/modules";

const mockUploadDocument = vi.fn();

vi.mock("@/features/documents/hooks/use-documents", async () => {
  const { createMockDocumentsHook } = await import("@/testing/mocks/hooks");
  return {
    useDocuments: () => createMockDocumentsHook({ uploadDocument: mockUploadDocument }),
  };
});

function renderFileUpload(supportsImages = true) {
  return renderHook(() => useFileUpload({ supportsImages, selectedModelName: "GPT-4" }));
}

describe("useFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadDocument.mockResolvedValue({ id: 1, filename: "test.txt" });
  });

  it("adds files to state and uploads text files", async () => {
    const { result } = renderFileUpload();

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("test.txt", "content")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(1);
    expect(mockUploadDocument).toHaveBeenCalledTimes(1);
  });

  it("rejects images when not supported", async () => {
    const { result } = renderFileUpload(false);

    await act(async () => {
      await result.current.handleFilesSelected(
        createMockFileList([createMockFile("image.png", "data", "image/png")])
      );
    });

    expect(result.current.attachedFiles).toHaveLength(0);
    expect(mockToast.error).toHaveBeenCalled();
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

  it("removes, clears, and replaces files", async () => {
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

    const newFile: AttachedFile = {
      id: "new-id",
      file: createMockFile("new.txt", "content"),
      type: "text",
      content: "content",
    };
    act(() => result.current.replaceFiles([newFile]));
    expect(result.current.attachedFiles).toHaveLength(1);
    expect(result.current.attachedFiles[0].id).toBe("new-id");

    act(() => result.current.clearFiles());
    expect(result.current.attachedFiles).toHaveLength(0);
  });
});
