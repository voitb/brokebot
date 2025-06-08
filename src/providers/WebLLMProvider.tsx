import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";

import WebLLMWorker from "../worker.ts?worker";

type EngineState = {
  engine: WebWorkerMLCEngine | null;
  isLoading: boolean;
  progress: number;
  status: string;
};

const WebLLMContext = createContext<EngineState | undefined>(undefined);

type WebLLMProviderProps = {
  children: ReactNode;
};

export const WebLLMProvider = ({ children }: WebLLMProviderProps) => {
  const [engineState, setEngineState] = useState<EngineState>({
    engine: null,
    isLoading: true,
    progress: 0,
    status: "Inicjalizacja...",
  });

  const initializeEngine = useCallback(async () => {
    try {
      const newEngine = await CreateWebWorkerMLCEngine(
        new WebLLMWorker(),
        "Llama-3-8B-Instruct-q4f32_1-MLC",
        {
          initProgressCallback: (report) => {
            setEngineState((prev) => ({
              ...prev,
              progress: report.progress,
              status: report.text,
            }));
          },
        }
      );
      setEngineState({
        engine: newEngine,
        isLoading: false,
        progress: 1,
        status: "Gotowy",
      });
    } catch (error) {
      console.error("Błąd inicjalizacji silnika WebLLM:", error);
      setEngineState((prev) => ({
        ...prev,
        isLoading: false,
        status: "Błąd inicjalizacji",
      }));
    }
  }, []);

  useEffect(() => {
    initializeEngine();
  }, [initializeEngine]);

  return (
    <WebLLMContext.Provider value={engineState}>
      {children}
    </WebLLMContext.Provider>
  );
};

export const useWebLLM = () => {
  const context = useContext(WebLLMContext);
  if (context === undefined) {
    throw new Error("useWebLLM must be used within a WebLLMProvider");
  }
  return context;
};
