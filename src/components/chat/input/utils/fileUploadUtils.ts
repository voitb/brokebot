import { toast } from "sonner";
import type { Document } from "@/lib/db";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "text" | "other";
  document?: Document;
  content?: string;
}

/**
 * Reads file content as text
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Processes a file for attachment to a message
 */
export async function processFile(
  file: File,
  uploadDocument: (file: File) => Promise<Document | null>
): Promise<AttachedFile> {
  const id = crypto.randomUUID();
  let type: AttachedFile["type"] = "other";
  let preview: string | undefined;
  let content: string | undefined;
  let document: Document | undefined;

  if (file.type.startsWith("image/")) {
    type = "image";
    preview = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  } else if (
    file.type === "text/plain" ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".md")
  ) {
    type = "text";

    try {
      content = await readFileContent(file);
      const savedDocument = await uploadDocument(file);
      if (savedDocument) {
        document = savedDocument;
      }
    } catch {
      toast.error("Failed to process text file");
    }
  }

  return { id, file, preview, type, content, document };
}

/**
 * Validates a file for size and type constraints
 */
export function validateFile(
  file: File,
  supportsImages: boolean,
  selectedModelName: string
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File ${file.name} is too large. Maximum size is 10MB.`,
    };
  }

  if (file.type.startsWith("image/") && !supportsImages) {
    return {
      valid: false,
      error: `Images are only supported by vision models. Current model: ${selectedModelName}`,
    };
  }

  return { valid: true };
}
