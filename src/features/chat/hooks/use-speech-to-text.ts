import { useState, useRef, useEffect, useEffectEvent } from "react";
import { toast } from "sonner";
import { transcribe } from "@/features/chat/api/transcriber/transcribe";

const STT_TOAST_ID = "stt-toast";

const MODEL_DOWNLOAD_MESSAGE =
  "Downloading the speech model (onnx-community/whisper-base)";

const DISCARDED_MESSAGE = "Voice input discarded.";

const CHUNK_LENGTH_S = 30;
const STRIDE_LENGTH_S = 5;

export type TranscriberStatus =
  | "ready"
  | "pending"
  | "recording"
  | "processing"
  | "error";

export interface UseSpeechToTextResult {
  status: TranscriberStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
}

export function useSpeechToText(
  onTranscriptReceived: (transcript: string) => void
): UseSpeechToTextResult {
  const [status, setStatus] = useState<TranscriberStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isUnmountedRef = useRef(false);
  const isStartingRef = useRef(false);

  const onTranscript = useEffectEvent((transcript: string) => {
    onTranscriptReceived(transcript);
  });

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      setStatus("ready");
      return;
    }

    if (isUnmountedRef.current) {
      audioChunksRef.current = [];
      toast.info(DISCARDED_MESSAGE, { id: STT_TOAST_ID });
      return;
    }

    setStatus("processing");
    toast.loading("Transcribing audio...", { id: STT_TOAST_ID });
    const audioBlob = new Blob(audioChunksRef.current, {
      type: mediaRecorderRef.current?.mimeType,
    });
    audioChunksRef.current = [];

    try {
      const result = await transcribe(
        audioBlob,
        {
          chunk_length_s: CHUNK_LENGTH_S,
          stride_length_s: STRIDE_LENGTH_S,
          task: "transcribe",
        },
        {
          onStatus: (workerStatus) => {
            if (workerStatus === "loading") {
              setStatus("processing");
              toast.loading(MODEL_DOWNLOAD_MESSAGE, {
                id: STT_TOAST_ID,
                description: "This happens once.",
              });
            } else if (workerStatus === "transcribing") {
              toast.loading("Transcribing audio...", { id: STT_TOAST_ID });
            }
          },
          onProgress: (info) => {
            if (info.progress !== undefined) {
              toast.loading(MODEL_DOWNLOAD_MESSAGE, {
                id: STT_TOAST_ID,
                description: `${Math.round(info.progress)}%`,
              });
            }
          },
        }
      );

      toast.dismiss(STT_TOAST_ID);

      if (isUnmountedRef.current) {
        toast.info(DISCARDED_MESSAGE);
        return;
      }

      const newTranscript = result?.text?.trim() ?? "";

      if (newTranscript) {
        onTranscript(newTranscript);
      }

      setStatus("ready");
    } catch {
      toast.error("An error occurred during transcription.", { id: STT_TOAST_ID });

      if (isUnmountedRef.current) {
        return;
      }

      setError("An error occurred during transcription.");
      setStatus("ready");
    }
  };

  const startRecording = async () => {
    if (
      isStartingRef.current ||
      status === "pending" ||
      status === "recording" ||
      status === "processing"
    ) {
      return;
    }

    isStartingRef.current = true;
    setError(null);
    setStatus("pending");

    try {
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (isUnmountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = handleRecordingStop;

      recorder.start();
      setStatus("recording");
      toast.message("Recording...", {
        description: "Click the mic icon to stop.",
        id: STT_TOAST_ID,
      });
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const message =
        error instanceof Error && error.message.includes("not supported")
          ? "Audio recording is not supported in your browser."
          : "Could not access microphone. Please check permissions.";
      setError(message);
      setStatus("error");
      toast.error(message, { id: STT_TOAST_ID });
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return { status, startRecording, stopRecording, error };
}
