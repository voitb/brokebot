import { useState } from "react";
import {
  uploadConversations,
  downloadAndMergeConversations,
} from "../../lib/sync/manualSync";
import { toast } from "sonner";

export function useManualSync() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    try {
      await uploadConversations();
      toast.success("Upload Complete", {
        description: "Your conversations have been sent to the cloud.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Upload Failed", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await downloadAndMergeConversations();
      toast.success("Download Complete", {
        description: "Cloud data has been synced to this device.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Download Failed", {
        description: errorMessage,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isUploading,
    isDownloading,
    error,
    handleUpload,
    handleDownload,
  };
} 