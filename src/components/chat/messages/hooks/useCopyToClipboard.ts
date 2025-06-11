import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CopyToClipboardResult } from "../types";

/**
 * Custom hook for copying text to clipboard with feedback
 */
export const useCopyToClipboard = (): CopyToClipboardResult => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  return {
    copied,
    copyToClipboard,
  };
}; 