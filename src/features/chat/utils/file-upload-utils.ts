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

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

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
      content = await readFileAsText(file);
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

export interface ValidateFileOptions {
  supportsImages: boolean;
  modelName: string;
}

export function validateFile(file: File, options: ValidateFileOptions): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File ${file.name} is too large. Maximum size is 10MB.`;
  }

  if (file.type.startsWith("image/") && !options.supportsImages) {
    return `Images are only supported by vision models. Current model: ${options.modelName}`;
  }

  return null;
}
