import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/app/app";
import { ChatGuard } from "@/features/chat/components/interface/chat-guard";
import { RouteLoadingFallback } from "@/components/ui/route-loading-fallback";

const WelcomeScreen = lazy(() =>
  import("@/app/pages/welcome").then((m) => ({
    default: m.WelcomeScreen,
  }))
);

const ChatInterface = lazy(() =>
  import("@/features/chat/components/interface/chat-interface").then((m) => ({
    default: m.ChatInterface,
  }))
);

const TermsOfService = lazy(() =>
  import("@/app/pages/terms-of-service").then((m) => ({
    default: m.TermsOfService,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoadingFallback />}>
            <WelcomeScreen />
          </Suspense>
        ),
      },
      {
        path: "chat",
        element: <Navigate to="/" replace />,
      },
      {
        path: "chat/:id",
        element: (
          <ChatGuard>
            <Suspense fallback={<RouteLoadingFallback />}>
              <ChatInterface />
            </Suspense>
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
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <TermsOfService />
      </Suspense>
    ),
  },
]);
