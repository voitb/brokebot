import { useRef, useState, useEffect } from "react";
import { useModel } from "@/providers/model-provider";
import type { OpenRouterMessage } from "@/lib/openrouter";

export interface StreamResult {
  content: string;
  wasAborted: boolean;
  error?: Error;
}

interface UseMessageStreamReturn {
  isGenerating: boolean;
  streamResponse: (
    messages: OpenRouterMessage[],
    onChunk: (content: string) => void
  ) => Promise<StreamResult>;
  stopGeneration: () => void;
}

export function useMessageStream(): UseMessageStreamReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { streamMessage, interruptGeneration, resetChat } = useModel();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      interruptGeneration();
    }
    setIsGenerating(false);
  };

  const streamResponse = async (
    messages: OpenRouterMessage[],
    onChunk: (content: string) => void
  ): Promise<StreamResult> => {
    abortControllerRef.current = new AbortController();
    setIsGenerating(true);

    let accumulatedContent = "";

    try {
      for await (const chunk of streamMessage(
        messages,
        undefined,
        abortControllerRef.current.signal
      )) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (chunk.error && chunk.error !== "stopped") {
          throw new Error(chunk.error);
        }

        if (chunk.error === "stopped") {
          break;
        }

        accumulatedContent = chunk.content;
        onChunk(accumulatedContent);

        if (chunk.isComplete) {
          break;
        }
      }

      return {
        content: accumulatedContent,
        wasAborted: abortControllerRef.current.signal.aborted,
      };
    } catch (error) {
      return {
        content: accumulatedContent,
        wasAborted: abortControllerRef.current?.signal.aborted ?? false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    } finally {
      setIsGenerating(false);
      const wasAborted = abortControllerRef.current?.signal.aborted ?? false;
      abortControllerRef.current = null;

      if (wasAborted) {
        await resetChat();
      }
    }
  };

  return {
    isGenerating,
    streamResponse,
    stopGeneration,
  };
}
