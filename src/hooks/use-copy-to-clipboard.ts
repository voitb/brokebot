import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const COPY_FEEDBACK_DURATION_MS = 2000;

interface CopyToClipboardResult {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

export function useCopyToClipboard(): CopyToClipboardResult {
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
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return {
    copied,
    copyToClipboard,
  };
}
