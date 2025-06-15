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

/**
 * A senior-level hook for handling speech-to-text functionality.
 *
 * This hook encapsulates the entire STT logic, from loading the model
 * to recording audio and processing the transcript. It follows best practices
 * by separating concerns (model management is in SpeechRecognitionService),
 * managing state cleanly, and decoupling from UI side-effects like toasts.
 *
 * @param onTranscriptReceived - Callback function invoked with the final transcript.
 * @returns An object with status, control functions, and error state.
 */
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
      }).catch(err => {
        console.error("Failed to load speech model:", err);
        setError("Failed to load speech recognition model.");
        setStatus("error");
      });
    }
  }, [status]);

  const handleRecordingStop = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
        console.warn("No audio chunks recorded.");
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

        const newTranscript = (result as any)?.text?.trim() ?? "";
        if (newTranscript) {
            onTranscriptReceived(newTranscript);
        } else {
            console.warn("Transcription resulted in empty text.");
        }
    } catch (err) {
        console.error("Transcription failed:", err);
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
      console.warn(`Cannot start recording in status: ${status}`);
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
    } catch (err) {
      console.error("Failed to start recording:", err);
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