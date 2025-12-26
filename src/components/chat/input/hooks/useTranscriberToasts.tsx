import { useEffect } from "react";
import { toast } from "sonner";
import { Mic } from "lucide-react";
import type { TranscriberStatus } from "./useSpeechToText";

const STT_TOAST_ID = "stt-toast";

export function useTranscriberToasts(
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
          icon: <Mic className="h-4 w-4" />,
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
