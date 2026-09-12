import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
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

function ChatRoute() {
  const { id } = useParams();

  return (
    <ChatGuard>
      <Suspense fallback={<RouteLoadingFallback />}>
        <ChatInterface key={id} />
      </Suspense>
    </ChatGuard>
  );
}

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
        element: <ChatRoute />,
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
