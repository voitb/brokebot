import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFileUpload, type AttachedFile } from "./useFileUpload";
import { mockToast, createMockFile, createMockFileList } from "@/test/mocks/modules";

// Helper to assert file result is defined after act() completes
function assertFile(file: AttachedFile | null): AttachedFile {
  if (!file) throw new Error("File not initialized");
  return file;
}

const mockUploadDocument = vi.fn();

vi.mock("@/hooks/useDocuments", async () => {
  const { createMockDocumentsHook } = await import("@/test/mocks/hooks");
  return {
    useDocuments: () => createMockDocumentsHook({
      uploadDocument: mockUploadDocument,
    }),
  };
});

describe("useFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadDocument.mockResolvedValue({ id: 1, filename: "test.txt" });
  });

  describe("initial state", () => {
    it("starts with empty attached files", () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      expect(result.current.attachedFiles).toEqual([]);
    });
  });

  describe("handleFilesSelected", () => {
    it("processes text files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Hello world");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
      expect(result.current.attachedFiles[0].type).toBe("text");
      expect(result.current.attachedFiles[0].file.name).toBe("test.txt");
    });

    it("processes markdown files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("readme.md", "# Header", "text/markdown");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
      expect(result.current.attachedFiles[0].type).toBe("text");
    });

    it("processes image files when supported", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4 Vision" })
      );

      const file = createMockFile("image.png", "fake-image-data", "image/png");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
      expect(result.current.attachedFiles[0].type).toBe("image");
    });

    it("rejects image files when not supported", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: false, selectedModelName: "GPT-3.5" })
      );

      const file = createMockFile("image.png", "fake-image-data", "image/png");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Images are only supported by vision models")
      );
    });

    it("rejects files larger than 10MB", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const largeFile = createMockFile("large.txt", "x", "text/plain", 11 * 1024 * 1024);
      const fileList = createMockFileList([largeFile]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("too large")
      );
    });

    it("accepts files exactly 10MB", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const exactFile = createMockFile("exact.txt", "x", "text/plain", 10 * 1024 * 1024);
      const fileList = createMockFileList([exactFile]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
    });

    it("handles multiple files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");
      const fileList = createMockFileList([file1, file2]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(2);
    });

    it("appends to existing files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");

      await act(async () => {
        await result.current.handleFilesSelected(createMockFileList([file1]));
      });

      await act(async () => {
        await result.current.handleFilesSelected(createMockFileList([file2]));
      });

      expect(result.current.attachedFiles).toHaveLength(2);
    });

    it("saves text documents to database", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Hello world");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(mockUploadDocument).toHaveBeenCalled();
    });
  });

  describe("removeFile", () => {
    it("removes file by id", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Content");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      const fileId = result.current.attachedFiles[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
    });

    it("only removes specified file", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");
      const fileList = createMockFileList([file1, file2]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      const fileIdToRemove = result.current.attachedFiles[0].id;

      act(() => {
        result.current.removeFile(fileIdToRemove);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
      expect(result.current.attachedFiles[0].file.name).toBe("test2.txt");
    });
  });

  describe("clearFiles", () => {
    it("allows clearing all files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Content");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      act(() => {
        result.current.clearFiles();
      });

      expect(result.current.attachedFiles).toHaveLength(0);
    });
  });

  describe("replaceFiles", () => {
    it("allows replacing all files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");
      const fileList = createMockFileList([file1, file2]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(2);

      const newFile: AttachedFile = {
        id: "new-id",
        file: createMockFile("new.txt", "New content"),
        type: "text",
        content: "New content",
      };

      act(() => {
        result.current.replaceFiles([newFile]);
      });

      expect(result.current.attachedFiles).toHaveLength(1);
      expect(result.current.attachedFiles[0].id).toBe("new-id");
    });
  });

  describe("processFile", () => {
    it("generates preview for images", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4 Vision" })
      );

      const file = createMockFile("image.png", "fake-image-data", "image/png");

      let processedFile: AttachedFile | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      const file_ = assertFile(processedFile);
      expect(file_.preview).toBeDefined();
      expect(file_.preview).toContain("data:");
    });

    it("reads content for text files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Hello world content");

      let processedFile: AttachedFile | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      await waitFor(() => {
        expect(assertFile(processedFile).content).toBe("Hello world content");
      });
    });

    it("generates unique ids for files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");

      let processed1: AttachedFile | null = null;
      let processed2: AttachedFile | null = null;

      await act(async () => {
        processed1 = await result.current.processFile(file1);
        processed2 = await result.current.processFile(file2);
      });

      expect(assertFile(processed1).id).not.toBe(assertFile(processed2).id);
    });

    it("categorizes other file types", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("data.json", '{"key": "value"}', "application/json");

      let processedFile: AttachedFile | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      expect(assertFile(processedFile).type).toBe("other");
    });
  });

  describe("error handling", () => {
    it("handles uploadDocument rejection gracefully", async () => {
      mockUploadDocument.mockRejectedValue(new Error("Upload failed"));

      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "content");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      // File should still be added even if document upload fails
      expect(result.current.attachedFiles.length).toBe(1);
      expect(result.current.attachedFiles[0].document).toBeUndefined();
    });
  });

  describe("parallel processing", () => {
    it("processes multiple files concurrently", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "content1");
      const file2 = createMockFile("test2.txt", "content2");
      const file3 = createMockFile("test3.txt", "content3");
      const fileList = createMockFileList([file1, file2, file3]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles.length).toBe(3);
    });
  });
});
