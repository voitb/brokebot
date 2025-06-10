import React, { useRef } from "react";
import { Button } from "../../../ui/button";
import { Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";

export interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "text" | "other";
}

interface FileUploadProps {
  attachedFiles: AttachedFile[];
  onFilesAttached: (files: AttachedFile[]) => void;
  onFileRemoved: (fileId: string) => void;
  supportsImages: boolean;
  selectedModelName: string;
  disabled?: boolean;
}

/**
 * File upload component with drag & drop support
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  attachedFiles,
  onFilesAttached,
  onFileRemoved,
  supportsImages,
  selectedModelName,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<AttachedFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    let type: AttachedFile["type"] = "other";
    let preview: string | undefined;

    if (file.type.startsWith("image/")) {
      type = "image";
      // Create preview for images
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

  const handleFileSelect = async (files: FileList) => {
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

    if (newFiles.length > 0) {
      onFilesAttached([...attachedFiles, ...newFiles]);
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      await handleFileSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportsImages ? "image/*,.txt,.md" : ".txt,.md"}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => fileInputRef.current?.click()}
        title="Attach files"
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  );
};

interface AttachedFilesPreviewProps {
  attachedFiles: AttachedFile[];
  onFileRemoved: (fileId: string) => void;
}

/**
 * Preview component for attached files
 */
export const AttachedFilesPreview: React.FC<AttachedFilesPreviewProps> = ({
  attachedFiles,
  onFileRemoved,
}) => {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {attachedFiles.map((file) => (
        <div
          key={file.id}
          className="relative bg-muted rounded-lg p-2 flex items-center gap-2 max-w-xs"
        >
          {file.type === "image" && file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : file.type === "text" ? (
            <FileText className="w-8 h-8 text-blue-500" />
          ) : (
            <Paperclip className="w-8 h-8 text-gray-500" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onFileRemoved(file.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};
