import { vi } from "vitest";

/**
 * Creates a mock File object for testing
 * Used in useFileUpload, useDragDrop, useDocuments, fileUploadUtils tests
 */
export function createMockFile(
  name: string,
  content = "content",
  type = "text/plain",
  size?: number
): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  // jsdom implements no Blob.prototype.text
  Object.defineProperty(file, "text", { value: async () => content, configurable: true });
  return file;
}

/**
 * Creates a mock FileList object for testing drag-drop and file input scenarios
 */
export function createMockFileList(files: File[]): FileList {
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

/**
 * Creates a mock DragEvent for testing drag-drop handlers
 */
export function createMockDragEvent(
  type: string,
  options: { files?: File[]; types?: string[] } = {}
): React.DragEvent {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      files: options.files || [],
      types: options.types || ["Files"],
    },
  } as unknown as React.DragEvent;
}
