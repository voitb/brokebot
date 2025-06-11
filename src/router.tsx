import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { ChatInterface } from "./components/chat/interface";
import { ChatGuard } from "./components/chat/interface/components";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SharedChatPage } from "./pages/SharedChatPage";
import { TermsOfService } from "./pages/TermsOfService";
import { Navigate } from "react-router-dom";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";

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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/share/:shareId",
    element: <SharedChatPage />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
]); 