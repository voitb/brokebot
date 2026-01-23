interface ThinkingSectionProps {
  thinking: string;
}

function ThinkingDot() {
  return <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />;
}

function ThinkingHeader() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <ThinkingDot />
    </div>
  );
}

export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  if (!thinking.trim()) {
    return null;
  }

  return (
    <div className="mb-2 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
      <ThinkingHeader />
      <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
        {thinking}
      </div>
    </div>
  );
}
