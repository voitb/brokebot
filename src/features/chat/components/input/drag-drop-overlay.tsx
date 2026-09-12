interface DragDropOverlayProps {
  isDragOver: boolean;
}

export function DragDropOverlay({ isDragOver }: DragDropOverlayProps) {
  if (!isDragOver) return null;

  return (
    <div 
      className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg z-10 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center">
        <div className="text-2xl mb-2">📎</div>
        <p className="text-sm font-medium">Drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">
          Text files only (.txt, .md)
        </p>
      </div>
    </div>
  );
};
