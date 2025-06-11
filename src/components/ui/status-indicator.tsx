import React from "react";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatusIndicatorProps {
  status: "loading" | "success" | "error" | "warning" | "idle";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

/**
 * Status indicator component with icons and animations
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  status,
  size = "md",
  showIcon = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const iconSize = sizeClasses[size];

  const statusConfig = {
    loading: {
      icon: <Loader2 className={cn(iconSize, "animate-spin")} />,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    success: {
      icon: <CheckCircle className={iconSize} />,
      color: "text-green-600 dark:text-green-400", 
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    error: {
      icon: <AlertCircle className={iconSize} />,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    warning: {
      icon: <Clock className={iconSize} />,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20"
    },
    idle: {
      icon: <div className={cn(iconSize, "rounded-full bg-gray-400")} />,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-900/20"
    }
  };

  const config = statusConfig[status];

  if (!showIcon) {
    return (
      <div 
        className={cn(
          "w-2 h-2 rounded-full", 
          config.bgColor,
          className
        )} 
      />
    );
  }

  return (
    <div className={cn(config.color, className)}>
      {config.icon}
    </div>
  );
}); 