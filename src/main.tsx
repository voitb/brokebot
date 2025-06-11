import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { WebLLMProvider } from "./providers/WebLLMProvider.tsx";
import { ModelProvider } from "./providers/ModelProvider.tsx";
import { ThemeProvider } from "./providers/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <WebLLMProvider>
        <ModelProvider>
          <App />
        </ModelProvider>
      </WebLLMProvider>
    </ThemeProvider>
  </StrictMode>
);
