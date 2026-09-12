import { toast } from "sonner";
import type { Document } from "@/lib/db";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const TEXT_FILE_EXTENSIONS = [".txt", ".md"];

// one attachment must not be able to fill the whole request body
const ATTACHMENT_CHAR_BUDGET = 200_000;

export interface AttachedFile {
  id: string;
  file: File;
  type: "text" | "other";
  document?: Document;
  content: string;
}

function isTextFile(file: File): boolean {
  return (
    file.type === "text/plain" ||
    TEXT_FILE_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension))
  );
}

export async function processFile(
  file: File,
  persistToLibrary?: (file: File) => Promise<Document | null>
): Promise<AttachedFile> {
  const id = crypto.randomUUID();
  let type: AttachedFile["type"] = "other";
  let content = "";
  let document: Document | undefined;

  if (isTextFile(file)) {
    type = "text";
    const text = await file.text();

    if (text.length > ATTACHMENT_CHAR_BUDGET) {
      toast.info(`${file.name} was truncated to the first ${ATTACHMENT_CHAR_BUDGET} characters.`);
      content = `${text.slice(0, ATTACHMENT_CHAR_BUDGET)}\n[truncated: only the first ${ATTACHMENT_CHAR_BUDGET} characters of ${file.name} were sent]`;
    } else {
      content = text;
    }

    if (persistToLibrary) {
      try {
        const savedDocument = await persistToLibrary(file);
        if (savedDocument) {
          document = savedDocument;
        }
      } catch {
        toast.error("Failed to process text file");
      }
    }
  }

  return { id, file, type, content, document };
}

export interface ValidateFileOptions {
  modelName: string;
}

export function validateFile(file: File, options: ValidateFileOptions): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File ${file.name} is too large. Maximum size is 10MB.`;
  }

  if (file.type.startsWith("image/")) {
    return `Image attachments are not supported yet. ${options.modelName} receives text only.`;
  }

  if (!isTextFile(file)) {
    return `File ${file.name} is not a supported type. Attach a text file (.txt, .md).`;
  }

  return null;
}
