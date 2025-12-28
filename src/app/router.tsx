import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/app/app";
import { WelcomeScreen } from "@/features/welcome/components/welcome-screen";
import { ChatInterface } from "@/features/chat/components/interface/chat-interface";
import { ChatGuard } from "@/features/chat/components/interface/components/chat-guard";
import { TermsOfService } from "@/pages/terms-of-service";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <WelcomeScreen />,
      },
      {
        path: "chat",
        element: <Navigate to="/" replace />,
      },
      {
        path: "chat/:id",
        element: (
          <ChatGuard>
            <ChatInterface />
          </ChatGuard>
        ),
      },
    ],
  },
  {
    path: "/settings",
    element: <Navigate to="/?modal=settings" replace />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
]);
