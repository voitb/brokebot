import { useState, useCallback } from "react";

interface UseDragDropReturn {
  isDragOver: boolean;
  handleDrop: (e: React.DragEvent, onFilesSelected: (files: FileList) => void) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
}

/**
 * Hook for drag and drop functionality
 */
export function useDragDrop(): UseDragDropReturn {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent, onFilesSelected: (files: FileList) => void) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return {
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  };
} 