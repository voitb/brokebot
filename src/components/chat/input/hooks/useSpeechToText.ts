import { useState, useRef, useEffect } from "react";
import { getTranscriber } from "../../../../lib/transcriber";

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

export const useSpeechToText = (
  onTranscriptReceived: (transcript: string) => void
): UseSpeechToTextResult => {
  const [status, setStatus] = useState<TranscriberStatus>("uninitialized");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isModelLoading = status === "loading";

  useEffect(() => {
    if (status === "uninitialized") {
      setStatus("loading");
      getTranscriber()
        .then(() => setStatus("ready"))
        .catch(() => {
          setError("Failed to load speech recognition model.");
          setStatus("error");
        });
    }
  }, [status]);

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
        chunk_length_s: 30,
        stride_length_s: 5,
        task: "transcribe",
      });

      const newTranscript = (result as { text?: string })?.text?.trim() ?? "";
      if (newTranscript) {
        onTranscriptReceived(newTranscript);
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
    } catch {
      setError("Could not access microphone. Please check permissions.");
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
};
