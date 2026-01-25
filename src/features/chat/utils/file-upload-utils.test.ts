import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateFile, processFile, type ValidateFileOptions } from "./file-upload-utils";
import { createMockFile } from "@/testing/mocks/modules";

describe("validateFile", () => {
  const defaultOptions: ValidateFileOptions = {
    supportsImages: true,
    modelName: "GPT-4",
  };

  it("accepts valid files under size limit", () => {
    const file = createMockFile("test.txt", "Hello world");

    expect(validateFile(file, defaultOptions)).toEqual({ valid: true });
  });

  it("rejects files larger than 10MB", () => {
    const file = createMockFile("large.txt", "x", "text/plain", 11 * 1024 * 1024);

    const result = validateFile(file, defaultOptions);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("rejects images when model does not support them", () => {
    const file = createMockFile("image.png", "fake", "image/png");

    const result = validateFile(file, { supportsImages: false, modelName: "GPT-3.5" });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("vision models");
  });
});

describe("processFile", () => {
  const mockUploadDocument = vi.fn();

  beforeEach(() => {
    mockUploadDocument.mockReset();
    mockUploadDocument.mockResolvedValue({ id: 1, filename: "test.txt" });
  });

  it("processes text files with content and uploads to storage", async () => {
    const content = "Hello world";
    const file = createMockFile("doc.txt", content);
    const mockDoc = { id: 123, filename: "doc.txt" };
    mockUploadDocument.mockResolvedValue(mockDoc);

    const result = await processFile(file, mockUploadDocument);

    expect(result.type).toBe("text");
    expect(result.content).toBe(content);
    expect(result.document).toEqual(mockDoc);
  });

  it("handles upload failure gracefully", async () => {
    mockUploadDocument.mockRejectedValue(new Error("Upload failed"));
    const file = createMockFile("doc.txt", "Hello");

    const result = await processFile(file, mockUploadDocument);

    expect(result.document).toBeUndefined();
  });
});
