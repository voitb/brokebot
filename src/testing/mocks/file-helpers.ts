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
 * Creates a mock DataTransfer object for testing drag-drop events
 */
export function createMockDataTransfer(files: File[]): DataTransfer {
  const fileList = createMockFileList(files);
  return {
    files: fileList,
    items: files.map((file) => ({
      kind: "file",
      type: file.type,
      getAsFile: () => file,
    })),
    types: ["Files"],
  } as unknown as DataTransfer;
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
