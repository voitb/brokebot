import { useState } from "react";
import { toast } from "sonner";
import type { Document } from "@/lib/db";
import {
  processFile as processFileUtil,
  validateFile,
  type AttachedFile,
} from "@/features/chat/utils/file-upload-utils";

export type { AttachedFile };

interface UseFileUploadProps {
  selectedModelName: string;
  persistToLibrary?: (file: File) => Promise<Document | null>;
}

interface UseFileUploadReturn {
  attachedFiles: AttachedFile[];
  clearFiles: () => void;
  handleFilesSelected: (files: FileList) => Promise<AttachedFile[]>;
  removeFile: (fileId: string) => void;
}

export function useFileUpload({
  selectedModelName,
  persistToLibrary,
}: UseFileUploadProps): UseFileUploadReturn {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const handleFilesSelected = async (files: FileList): Promise<AttachedFile[]> => {
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      const error = validateFile(file, { modelName: selectedModelName });
      if (error) {
        toast.error(error);
        continue;
      }
      validFiles.push(file);
    }

    const results = await Promise.allSettled(
      validFiles.map((file) => processFileUtil(file, persistToLibrary))
    );

    const processedFiles: AttachedFile[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        toast.error(`Failed to read ${validFiles[index].name}`);
        return;
      }
      processedFiles.push(result.value);
    });

    setAttachedFiles((prev) => [...prev, ...processedFiles]);
    return processedFiles;
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearFiles = () => setAttachedFiles([]);

  return {
    attachedFiles,
    clearFiles,
    handleFilesSelected,
    removeFile,
  };
} 