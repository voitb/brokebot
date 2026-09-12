import { useModel } from "@/hooks/use-model";
import type { OpenRouterMessage } from "@/features/chat/api/openrouter";
import { abortGeneration, endGeneration, startGeneration } from "./active-generations";

export interface StreamResult {
  content: string;
  error?: Error;
  isTruncated?: boolean;
}

interface UseMessageStreamReturn {
  streamResponse: (
    conversationId: string,
    messages: OpenRouterMessage[],
    onChunk: (content: string) => void
  ) => Promise<StreamResult>;
  stopGeneration: (conversationId: string) => void;
}

export function useMessageStream(): UseMessageStreamReturn {
  const { streamMessage, interruptGeneration } = useModel();

  const stopGeneration = (conversationId: string) => {
    if (abortGeneration(conversationId)) {
      interruptGeneration();
    }
  };

  const streamResponse = async (
    conversationId: string,
    messages: OpenRouterMessage[],
    onChunk: (content: string) => void
  ): Promise<StreamResult> => {
    const controller = new AbortController();
    startGeneration(conversationId, controller);

    let accumulatedContent = "";
    let isTruncated = false;

    try {
      for await (const chunk of streamMessage(messages, undefined, controller.signal)) {
        if (controller.signal.aborted) {
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
          isTruncated = chunk.isTruncated ?? false;
          break;
        }
      }

      return { content: accumulatedContent, isTruncated };
    } catch (error) {
      return {
        content: accumulatedContent,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    } finally {
      endGeneration(conversationId, controller);
    }
  };

  return {
    streamResponse,
    stopGeneration,
  };
}
