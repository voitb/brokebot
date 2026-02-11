import { useState, useRef, useEffect, useEffectEvent } from "react";
import { transcribe } from "@/features/chat/api/transcriber/transcribe";
import type { TranscribeResult } from "@/features/chat/api/transcriber/types";

const CHUNK_LENGTH_S = 30;
const STRIDE_LENGTH_S = 5;

export type TranscriberStatus =
  | "uninitialized"
  | "loading"
  | "ready"
  | "recording"
  | "processing"
  | "error";

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
  const [status, setStatus] = useState<TranscriberStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const onTranscript = useEffectEvent((transcript: string) => {
    onTranscriptReceived(transcript);
  });

  const isModelLoading = false;

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
            }
          },
        }
      );

      const newTranscript = (result as TranscribeResult)?.text?.trim() ?? "";

      if (newTranscript) {
        onTranscript(newTranscript);
      }
    } catch (err) {
      console.error("[STT] Transcription error:", err);
      setError("An error occurred during transcription.");
    } finally {
      setStatus("ready");
    }
  };

  const startRecording = async () => {
    if (status !== "ready") {
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
