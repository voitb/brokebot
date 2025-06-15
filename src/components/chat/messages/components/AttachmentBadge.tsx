import React from "react";

interface AttachmentBadgeProps {
  fileName: string;
}

export const AttachmentBadge: React.FC<AttachmentBadgeProps> = ({
  fileName,
}) => {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border bg-background p-2 pr-3 max-w-xs">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted">
        <span className="text-lg" role="img" aria-label="Paperclip">
          📎
        </span>
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-foreground">Attached File</p>
        <p className="truncate text-xs text-muted-foreground">{fileName}</p>
      </div>
    </div>
  );
}; 