import { useState } from "react";
import { toast } from "sonner";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "text" | "other";
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

  const processFile = async (file: File): Promise<AttachedFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    let type: AttachedFile["type"] = "other";
    let preview: string | undefined;

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
    }

    return { id, file, preview, type };
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