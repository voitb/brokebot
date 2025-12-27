import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface CopyToClipboardResult {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Custom hook for copying text to clipboard with feedback
 */
export const useCopyToClipboard = (): CopyToClipboardResult => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return {
    copied,
    copyToClipboard,
  };
}; 