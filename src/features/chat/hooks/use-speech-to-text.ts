import { useState, useRef, useEffect } from "react";
import { getTranscriber } from "@/lib/transcriber";

const CHUNK_LENGTH_S = 30;
const STRIDE_LENGTH_S = 5;

export type TranscriberStatus =
  | "uninitialized"
  | "loading"
  | "ready"
  | "recording"
  | "processing"
  | "error";

interface TranscriberResult {
  text?: string;
}

export interface UseSpeechToTextResult {
  status: TranscriberStatus;
  startRecording: () => void;
  stopRecording: () => void;
  isModelLoading: boolean;
  error: string | null;
}

export function useSpeechToText(
  onTranscriptReceived: (transcript: string) => void
): UseSpeechToTextResult {
  const [status, setStatus] = useState<TranscriberStatus>("uninitialized");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const onTranscriptReceivedRef = useRef(onTranscriptReceived);

  useEffect(() => {
    onTranscriptReceivedRef.current = onTranscriptReceived;
  }, [onTranscriptReceived]);

  const isModelLoading = status === "loading";

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    getTranscriber()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load speech recognition model.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      setStatus("ready");
      return;
    }

    setStatus("processing");
    const audioBlob = new Blob(audioChunksRef.current, {
      type: mediaRecorderRef.current?.mimeType,
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioChunksRef.current = [];

    try {
      const recognizer = await getTranscriber();
      const result = await recognizer(audioUrl, {
        chunk_length_s: CHUNK_LENGTH_S,
        stride_length_s: STRIDE_LENGTH_S,
        task: "transcribe",
      });

      const newTranscript = (result as TranscriberResult)?.text?.trim() ?? "";
      if (newTranscript) {
        onTranscriptReceivedRef.current(newTranscript);
      }
    } catch {
      setError("An error occurred during transcription.");
    } finally {
      URL.revokeObjectURL(audioUrl);
      setStatus("ready");
    }
  };

  const startRecording = async () => {
    if (status !== "ready") {
      if (status === "uninitialized" || status === "loading") {
        setError("Model is still loading, please wait.");
      }
      return;
    }

    setError(null);

    try {
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("not supported")
          ? "Audio recording is not supported in your browser."
          : "Could not access microphone. Please check permissions.";
      setError(message);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return { status, startRecording, stopRecording, isModelLoading, error };
}
