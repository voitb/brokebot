import { useState } from "react";
import { toast } from "sonner";
import { useDocuments } from "../../../../hooks/useDocuments";
import {
  processFile as processFileUtil,
  validateFile,
  type AttachedFile,
} from "../utils/fileUploadUtils";

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

export const useFileUpload = ({
  supportsImages,
  selectedModelName,
}: UseFileUploadProps): UseFileUploadReturn => {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const { uploadDocument } = useDocuments();

  const handleFilesSelected = async (files: FileList) => {
    const validFiles: File[] = [];

    for (const file of Array.from(files)) {
      const validation = validateFile(file, supportsImages, selectedModelName);
      if (!validation.valid) {
        toast.error(validation.error!);
        continue;
      }
      validFiles.push(file);
    }

    const processedFiles = await Promise.all(
      validFiles.map((file) => processFileUtil(file, uploadDocument))
    );
    setAttachedFiles((prev) => [...prev, ...processedFiles]);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return {
    attachedFiles,
    setAttachedFiles,
    handleFilesSelected,
    removeFile,
    processFile: (file: File) => processFileUtil(file, uploadDocument),
  };
}; 