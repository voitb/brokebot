import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/components/layouts";
import { Toaster } from "@/components/ui/sonner";
import { ModalRoot } from "@/app/modals/modal-root";
import { Seo } from "@/components/seo/seo";
import { PerformanceSEO } from "@/components/seo/performance-seo";
import { ErrorBoundary } from "@/components/errors/error-boundary";

export function RootLayout() {
  return (
    <>
      <Seo />
      <PerformanceSEO />
      <ErrorBoundary>
        <ResponsiveChatLayout>
          <Outlet />
          <Toaster position="top-right" />
          <ModalRoot />
        </ResponsiveChatLayout>
      </ErrorBoundary>
    </>
  );
}
