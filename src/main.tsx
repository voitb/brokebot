import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./router";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { WebLLMProvider } from "./providers/WebLLMProvider";
import { ModelProvider } from "./providers/ModelProvider";
import { ConversationsProvider } from "./providers/ConversationsProvider";
import "./index.css";
import { Toaster } from "sonner";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <WebLLMProvider>
              <ModelProvider>
                <ConversationsProvider>
                  <RouterProvider router={router} />
                </ConversationsProvider>
              </ModelProvider>
            </WebLLMProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
