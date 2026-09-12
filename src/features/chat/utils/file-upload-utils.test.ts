import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateFile, processFile, type ValidateFileOptions } from "./file-upload-utils";
import { formatAttachedFiles } from "@/features/chat/utils/chat-input-utils";
import { createMockFile, mockToast } from "@/testing/mocks/modules";

const defaultOptions: ValidateFileOptions = {
  modelName: "GPT-4",
};

describe("validateFile", () => {
  it("accepts valid files under size limit", () => {
    const file = createMockFile("test.txt", "Hello world");

    expect(validateFile(file, defaultOptions)).toBeNull();
  });

  it("rejects files larger than 10MB", () => {
    const file = createMockFile("large.txt", "x", "text/plain", 11 * 1024 * 1024);

    const result = validateFile(file, defaultOptions);

    expect(result).not.toBeNull();
    expect(result).toContain("too large");
  });

  it("rejects image files", () => {
    const file = createMockFile("image.png", "fake", "image/png");

    const result = validateFile(file, { modelName: "GPT-3.5" });

    expect(result).toContain("not supported");
  });

  it("rejects pdf files as an unsupported type", () => {
    const file = createMockFile("paper.pdf", "%PDF", "application/pdf");

    const result = validateFile(file, defaultOptions);

    expect(result).not.toBeNull();
    expect(result).toContain("not a supported type");
  });

  it("rejects docx files as an unsupported type", () => {
    const file = createMockFile(
      "paper.docx",
      "binary",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const result = validateFile(file, defaultOptions);

    expect(result).not.toBeNull();
    expect(result).toContain("not a supported type");
  });
});

describe("processFile", () => {
  const persistToLibrary = vi.fn();

  beforeEach(() => {
    persistToLibrary.mockReset();
  });

  it("processes text files without persisting them to the library", async () => {
    const file = createMockFile("doc.txt", "Hello world");

    const result = await processFile(file);

    expect(result.type).toBe("text");
    expect(result.content).toBe("Hello world");
    expect(result.document).toBeUndefined();
    expect(persistToLibrary).not.toHaveBeenCalled();
  });

  it("attaches the saved document when a persistence callback is provided", async () => {
    const file = createMockFile("doc.txt", "Hello");
    const mockDoc = { id: 123, filename: "doc.txt" };
    persistToLibrary.mockResolvedValue(mockDoc);

    const result = await processFile(file, persistToLibrary);

    expect(result.content).toBe("Hello");
    expect(result.document).toEqual(mockDoc);
  });

  it("handles a failing persistence callback gracefully", async () => {
    const file = createMockFile("doc.txt", "Hello");
    persistToLibrary.mockRejectedValue(new Error("Upload failed"));

    const result = await processFile(file, persistToLibrary);

    expect(result.document).toBeUndefined();
  });

  it("rejects when the file cannot be read", async () => {
    const file = createMockFile("doc.txt", "Hello");
    vi.spyOn(file, "text").mockRejectedValue(new Error("read failed"));

    await expect(processFile(file)).rejects.toThrow("read failed");
  });

  it("truncates an attachment past the character budget and names it in the marker", async () => {
    const file = createMockFile("huge.txt", "x".repeat(200_001));

    const result = await processFile(file);
    const [body, marker] = result.content.split("\n[truncated:");

    expect(body).toHaveLength(200_000);
    expect(marker).toContain("huge.txt");
    expect(mockToast.info).toHaveBeenCalledWith(expect.stringContaining("huge.txt"));
  });

  it("leaves an attachment sitting exactly on the budget untouched", async () => {
    const file = createMockFile("exact.txt", "x".repeat(200_000));

    const result = await processFile(file);

    expect(result.content).toBe("x".repeat(200_000));
    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("does not interpolate undefined for image attachments", async () => {
    const image = createMockFile("shot.png", "binary", "image/png");

    expect(validateFile(image, defaultOptions)).toContain("not supported");
    expect(
      formatAttachedFiles([await processFile(createMockFile("doc.txt", "Hello"))])
    ).not.toContain("undefined");
  });
});
