import { useState } from "react";
import { toast } from "sonner";
import { useDocuments } from "../../../../hooks/useDocuments";
import type { Document } from "../../../../lib/db";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "text" | "other";
  document?: Document; // Reference to saved document
  content?: string; // File content for AI processing
}

interface UseFileUploadProps {
  supportsImages: boolean;
  selectedModelName: string;
}

interface UseFileUploadReturn {
  attachedFiles: AttachedFile[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  handleFilesSelected: (files: FileList) => Promise<void>;
  removeFile: (fileId: string) => void;
  processFile: (file: File) => Promise<AttachedFile>;
}

/**
 * Custom hook for file upload management
 */
export const useFileUpload = ({
  supportsImages,
  selectedModelName,
}: UseFileUploadProps): UseFileUploadReturn => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const { uploadDocument } = useDocuments();

  const processFile = async (file: File): Promise<AttachedFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    let type: AttachedFile["type"] = "other";
    let preview: string | undefined;
    let content: string | undefined;
    let document: Document | undefined;

    if (file.type.startsWith("image/")) {
      type = "image";
      preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md")
    ) {
      type = "text";
      
      // Read text content for AI processing
      try {
        content = await readFileContent(file);
        
        // Save document to IndexedDB
        const savedDocument = await uploadDocument(file);
        if (savedDocument) {
          document = savedDocument;
        }
      } catch (error) {
        console.error("Failed to process text file:", error);
        toast.error("Failed to process text file");
      }
    }

    return { id, file, preview, type, content, document };
  };

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  const handleFilesSelected = async (files: FileList) => {
    const newFiles: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // For images, check if model supports them
      if (file.type.startsWith("image/") && !supportsImages) {
        toast.error(
          `Images are only supported by vision models. Current model: ${selectedModelName}`
        );
        continue;
      }

      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return {
    attachedFiles,
    setAttachedFiles,
    handleFilesSelected,
    removeFile,
    processFile,
  };
}; 