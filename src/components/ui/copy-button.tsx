import React from "react";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { useCopyToClipboard } from "../chat/messages/hooks/useCopyToClipboard";
import { cn } from "../../lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showTooltip?: boolean;
  children?: React.ReactNode;
}

/**
 * Reusable copy button component with clipboard functionality
 */
export const CopyButton: React.FC<CopyButtonProps> = React.memo(({
  value,
  className,
  size = "sm",
  variant = "ghost",
  showTooltip = false,
  children,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = () => {
    copyToClipboard(value);
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      className={cn("transition-opacity", className)}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {children}
    </Button>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}); 