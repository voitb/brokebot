import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/app/router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { WebLLMProvider } from "@/app/providers/web-llm-provider";
import { ModelProvider } from "@/app/providers/model-provider";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import "../index.css";

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
