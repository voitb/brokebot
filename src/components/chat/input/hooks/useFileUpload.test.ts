import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFileUpload } from "./useFileUpload";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockUploadDocument = vi.fn();

vi.mock("../../../../hooks/useDocuments", () => ({
  useDocuments: () => ({
    uploadDocument: mockUploadDocument,
  }),
}));

function createMockFile(name: string, content: string, type = "text/plain", size?: number): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  return file;
}

function createMockFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  };
  files.forEach((file, index) => {
    (fileList as Record<number, File>)[index] = file;
  });
  return fileList as unknown as FileList;
}

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
      const { toast } = await import("sonner");
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: false, selectedModelName: "GPT-3.5" })
      );

      const file = createMockFile("image.png", "fake-image-data", "image/png");
      const fileList = createMockFileList([file]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Images are only supported by vision models")
      );
    });

    it("rejects files larger than 10MB", async () => {
      const { toast } = await import("sonner");
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const largeFile = createMockFile("large.txt", "x", "text/plain", 11 * 1024 * 1024);
      const fileList = createMockFileList([largeFile]);

      await act(async () => {
        await result.current.handleFilesSelected(fileList);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith(
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

  describe("setAttachedFiles", () => {
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
        result.current.setAttachedFiles([]);
      });

      expect(result.current.attachedFiles).toHaveLength(0);
    });
  });

  describe("processFile", () => {
    it("generates preview for images", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4 Vision" })
      );

      const file = createMockFile("image.png", "fake-image-data", "image/png");

      let processedFile: Awaited<ReturnType<typeof result.current.processFile>> | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      expect(processedFile?.preview).toBeDefined();
      expect(processedFile?.preview).toContain("data:");
    });

    it("reads content for text files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("test.txt", "Hello world content");

      let processedFile: Awaited<ReturnType<typeof result.current.processFile>> | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      await waitFor(() => {
        expect(processedFile?.content).toBe("Hello world content");
      });
    });

    it("generates unique ids for files", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file1 = createMockFile("test1.txt", "Content 1");
      const file2 = createMockFile("test2.txt", "Content 2");

      let processed1: Awaited<ReturnType<typeof result.current.processFile>> | null = null;
      let processed2: Awaited<ReturnType<typeof result.current.processFile>> | null = null;

      await act(async () => {
        processed1 = await result.current.processFile(file1);
        processed2 = await result.current.processFile(file2);
      });

      expect(processed1?.id).not.toBe(processed2?.id);
    });

    it("categorizes other file types", async () => {
      const { result } = renderHook(() =>
        useFileUpload({ supportsImages: true, selectedModelName: "GPT-4" })
      );

      const file = createMockFile("data.json", '{"key": "value"}', "application/json");

      let processedFile: Awaited<ReturnType<typeof result.current.processFile>> | null = null;
      await act(async () => {
        processedFile = await result.current.processFile(file);
      });

      expect(processedFile?.type).toBe("other");
    });
  });
});
