import { useState, useRef, useCallback, useEffect } from "react";
import { SpeechRecognitionService } from "../../../../lib/speech-recognition";

export type TranscriberStatus =
  | "uninitialized"
  | "loading" // Model is loading
  | "ready"     // Ready to record
  | "recording"
  | "processing"// Transcribing audio
  | "error";

export interface UseSpeechToTextResult {
  status: TranscriberStatus;
  startRecording: () => void;
  stopRecording: () => void;
  isModelLoading: boolean;
  error: string | null;
}

/** Manages speech-to-text recording and transcription state */
export const useSpeechToText = (
  onTranscriptReceived: (transcript: string) => void
): UseSpeechToTextResult => {
  const [status, setStatus] = useState<TranscriberStatus>("uninitialized");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isModelLoading = status === "loading";

  // Pre-load the model when the hook is first used.
  useEffect(() => {
    if (status === "uninitialized") {
      setStatus("loading");
      SpeechRecognitionService.getInstance().then(() => {
        setStatus("ready");
      }).catch(() => {
        setError("Failed to load speech recognition model.");
        setStatus("error");
      });
    }
  }, [status]);

  const handleRecordingStop = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
        setStatus("ready");
        return;
    }
    
    setStatus("processing");
    const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType,
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioChunksRef.current = []; // Clear chunks for next recording

    try {
        const recognizer = await SpeechRecognitionService.getInstance();
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
  }, [onTranscriptReceived]);

  const startRecording = useCallback(async () => {
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
  }, [status, handleRecordingStop]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop(); // This will trigger onstop
      
      // Manually stop the stream tracks to turn off the mic indicator immediately
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [status]);

  return { status, startRecording, stopRecording, isModelLoading, error };
}; 