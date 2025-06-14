import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { WebLLMProvider } from "./providers/WebLLMProvider";
import { ModelProvider } from "./providers/ModelProvider";
import { ConversationsProvider } from "./providers/ConversationsProvider";
import "./index.css";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
      <TooltipProvider>
        <WebLLMProvider>
          <ModelProvider>
              <ConversationsProvider>
              <RouterProvider router={router} />
              <Toaster />
              </ConversationsProvider>
          </ModelProvider>
        </WebLLMProvider>
      </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
