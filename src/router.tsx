import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { ChatInterface } from "./components/chat/interface";
import { ChatGuard } from "./components/chat/interface/components";
import { SharedChatPage } from "./pages/SharedChatPage";
import { TermsOfService } from "./pages/TermsOfService";

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
    path: "/share/:shareId",
    element: <SharedChatPage />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
]); 