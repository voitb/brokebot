import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/app/root-layout";
import { ChatGuard } from "@/features/chat/components/interface/chat-guard";
import { RouteLoadingFallback } from "@/components/ui/route-loading-fallback";

const WelcomeScreen = lazy(() =>
  import("@/app/routes/landing").then((m) => ({
    default: m.WelcomeScreen,
  }))
);

const ChatInterface = lazy(() =>
  import("@/features/chat/components/interface/chat-interface").then((m) => ({
    default: m.ChatInterface,
  }))
);

const TermsOfService = lazy(() =>
  import("@/app/routes/terms").then((m) => ({
    default: m.TermsOfService,
  }))
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
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
