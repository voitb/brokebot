function AnimatedDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
    </div>
  );
}

export function LoadingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center space-x-1">
          <AnimatedDots />
        </div>
      </div>
    </div>
  );
}
