import { useRef, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText } from "lucide-react";
import { useFileUpload, type AttachedFile } from "@/features/chat/hooks/use-file-upload";

interface FileUploadProps {
  supportsImages: boolean;
  selectedModelName: string;
  disabled?: boolean;
  onFilesChanged?: (files: AttachedFile[]) => void;
}

export function FileUpload({
  supportsImages,
  selectedModelName,
  disabled = false,
  onFilesChanged,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { attachedFiles, handleFilesSelected } = useFileUpload({
    supportsImages,
    selectedModelName,
  });

  // Notify parent of file changes
  useEffect(() => {
    onFilesChanged?.(attachedFiles);
  }, [attachedFiles, onFilesChanged]);

  const handleFileInputChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      await handleFilesSelected(files);
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

interface FilePreviewItemProps {
  file: AttachedFile;
  onRemove: (fileId: string) => void;
}

function FilePreviewItem({
  file,
  onRemove,
}: FilePreviewItemProps) {
  return (
  <div className="relative bg-muted rounded-lg p-2 flex items-center gap-2 max-w-xs">
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
      onClick={() => onRemove(file.id)}
    >
      <X className="h-3 w-3" />
    </Button>
  </div>
  );
}

interface AttachedFilesPreviewProps {
  attachedFiles: AttachedFile[];
  onFileRemoved: (fileId: string) => void;
}

export function AttachedFilesPreview({
  attachedFiles,
  onFileRemoved,
}: AttachedFilesPreviewProps) {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {attachedFiles.map((file) => (
        <FilePreviewItem
          key={file.id}
          file={file}
          onRemove={onFileRemoved}
        />
      ))}
    </div>
  );
};
