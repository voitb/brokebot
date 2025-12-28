import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { WebLLMProvider } from "@/providers/web-llm-provider";
import { ModelProvider } from "@/providers/model-provider";
import { ConversationsProvider } from "@/providers/conversations-provider";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <WebLLMProvider>
            <ModelProvider>
              <ConversationsProvider>
                <RouterProvider router={router} />
              </ConversationsProvider>
            </ModelProvider>
          </WebLLMProvider>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
