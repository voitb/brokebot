import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateFile, processFile, readFileContent, type ValidateFileOptions } from "./fileUploadUtils";
import { createMockFile } from "@/test/mocks/modules";

describe("fileUploadUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateFile", () => {
    const defaultOptions: ValidateFileOptions = {
      supportsImages: true,
      modelName: "GPT-4",
    };

    it("accepts valid text files under size limit", () => {
      const file = createMockFile("test.txt", "Hello world");

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects files larger than 10MB", () => {
      const file = createMockFile("large.txt", "x", "text/plain", 11 * 1024 * 1024);

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("too large");
      expect(result.error).toContain("10MB");
    });

    it("accepts files exactly 10MB", () => {
      const file = createMockFile("exact.txt", "x", "text/plain", 10 * 1024 * 1024);

      const result = validateFile(file, defaultOptions);

      expect(result.valid).toBe(true);
    });

    it("accepts image files when model supports images", () => {
      const file = createMockFile("image.png", "fake-image", "image/png");

      const result = validateFile(file, { supportsImages: true, modelName: "GPT-4 Vision" });

      expect(result.valid).toBe(true);
    });

    it("rejects image files when model does not support images", () => {
      const file = createMockFile("image.png", "fake-image", "image/png");

      const result = validateFile(file, { supportsImages: false, modelName: "GPT-3.5" });

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Images are only supported by vision models");
      expect(result.error).toContain("GPT-3.5");
    });

    it("includes file name in size error message", () => {
      const file = createMockFile("my-large-document.txt", "x", "text/plain", 15 * 1024 * 1024);

      const result = validateFile(file, defaultOptions);

      expect(result.error).toContain("my-large-document.txt");
    });
  });

  describe("readFileContent", () => {
    it("reads text file content", async () => {
      const content = "Hello, World!";
      const file = createMockFile("test.txt", content);

      const result = await readFileContent(file);

      expect(result).toBe(content);
    });

    it("reads multi-line content", async () => {
      const content = "Line 1\nLine 2\nLine 3";
      const file = createMockFile("test.txt", content);

      const result = await readFileContent(file);

      expect(result).toBe(content);
    });
  });

  describe("processFile", () => {
    const mockUploadDocument = vi.fn();

    beforeEach(() => {
      mockUploadDocument.mockReset();
      mockUploadDocument.mockResolvedValue({ id: 1, filename: "test.txt" });
    });

    it("generates unique id for each file", async () => {
      const file1 = createMockFile("test1.txt", "content1");
      const file2 = createMockFile("test2.txt", "content2");

      const result1 = await processFile(file1, mockUploadDocument);
      const result2 = await processFile(file2, mockUploadDocument);

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it("identifies image files correctly", async () => {
      const file = createMockFile("image.png", "fake-image", "image/png");

      const result = await processFile(file, mockUploadDocument);

      expect(result.type).toBe("image");
    });

    it("generates preview for image files", async () => {
      const file = createMockFile("image.png", "fake-image", "image/png");

      const result = await processFile(file, mockUploadDocument);

      expect(result.preview).toBeDefined();
      expect(result.preview).toContain("data:");
    });

    it("identifies text files correctly", async () => {
      const file = createMockFile("document.txt", "Hello world");

      const result = await processFile(file, mockUploadDocument);

      expect(result.type).toBe("text");
    });

    it("identifies markdown files as text", async () => {
      const file = createMockFile("readme.md", "# Hello", "text/markdown");

      const result = await processFile(file, mockUploadDocument);

      expect(result.type).toBe("text");
    });

    it("reads content for text files", async () => {
      const content = "Hello world content";
      const file = createMockFile("document.txt", content);

      const result = await processFile(file, mockUploadDocument);

      expect(result.content).toBe(content);
    });

    it("uploads text documents", async () => {
      const file = createMockFile("document.txt", "Hello");

      await processFile(file, mockUploadDocument);

      expect(mockUploadDocument).toHaveBeenCalledWith(file);
    });

    it("stores document reference when upload succeeds", async () => {
      const mockDoc = { id: 123, filename: "test.txt" };
      mockUploadDocument.mockResolvedValue(mockDoc);
      const file = createMockFile("document.txt", "Hello");

      const result = await processFile(file, mockUploadDocument);

      expect(result.document).toEqual(mockDoc);
    });

    it("handles upload failure gracefully", async () => {
      mockUploadDocument.mockRejectedValue(new Error("Upload failed"));
      const file = createMockFile("document.txt", "Hello");

      const result = await processFile(file, mockUploadDocument);

      expect(result.document).toBeUndefined();
    });

    it("identifies other file types correctly", async () => {
      const file = createMockFile("data.json", '{"key": "value"}', "application/json");

      const result = await processFile(file, mockUploadDocument);

      expect(result.type).toBe("other");
    });

    it("preserves original file reference", async () => {
      const file = createMockFile("test.txt", "content");

      const result = await processFile(file, mockUploadDocument);

      expect(result.file).toBe(file);
    });
  });
});
