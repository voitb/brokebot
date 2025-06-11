import React from "react";

interface DragDropOverlayProps {
  isDragOver: boolean;
  supportsImages: boolean;
}

/**
 * Drag & drop overlay component
 */
export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  isDragOver,
  supportsImages,
}) => {
  if (!isDragOver) return null;

  return (
    <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg z-10 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">📎</div>
        <p className="text-sm font-medium">Drop files here</p>
        {!supportsImages && (
          <p className="text-xs text-muted-foreground mt-1">
            Images only supported by vision models
          </p>
        )}
      </div>
    </div>
  );
};
