import React from "react";
import { cn } from "../../lib/utils";

interface LoadingDotsProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "muted";
}

/**
 * Animated loading dots component
 */
export const LoadingDots: React.FC<LoadingDotsProps> = React.memo(({
  className,
  size = "md",
  color = "default",
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  };

  const colorClasses = {
    default: "bg-foreground",
    primary: "bg-primary",
    muted: "bg-muted-foreground"
  };

  const dotClass = cn(
    "rounded-full animate-bounce",
    sizeClasses[size],
    colorClasses[color]
  );

  return (
    <div className={cn("flex space-x-1", className)}>
      <div className={cn(dotClass, "[animation-delay:-0.3s]")} />
      <div className={cn(dotClass, "[animation-delay:-0.15s]")} />
      <div className={dotClass} />
    </div>
  );
}); 