import { useEffect } from "react";
import { toast } from "sonner";
import type { TranscriberStatus } from "./use-speech-to-text";

const STT_TOAST_ID = "stt-toast";

export function useSpeechNotifications(
  status: TranscriberStatus,
  error: string | null
): void {
  useEffect(() => {
    if (error) {
      toast.error(error, { id: STT_TOAST_ID });
      return;
    }

    switch (status) {
      case "loading":
        toast.loading("Loading speech model...", { id: STT_TOAST_ID });
        break;
      case "processing":
        toast.loading("Transcribing audio...", { id: STT_TOAST_ID });
        break;
      case "recording":
        toast.message("Recording...", {
          description: "Click the mic icon to stop.",
          id: STT_TOAST_ID,
        });
        break;
      case "ready":
      case "uninitialized":
      case "error":
        toast.dismiss(STT_TOAST_ID);
        break;
    }
  }, [status, error]);
}
