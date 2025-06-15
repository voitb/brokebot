import { useState, useRef } from "react";

interface UseDragDropReturn {
  isDragOver: boolean;
  handleDrop: (e: React.DragEvent, onFilesSelected: (files: FileList) => void) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
}

/**
 * Hook for drag and drop functionality with proper overlay handling
 */
export function useDragDrop(): UseDragDropReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    // Check if we're dragging files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, onFilesSelected: (files: FileList) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return {
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
  };
} 