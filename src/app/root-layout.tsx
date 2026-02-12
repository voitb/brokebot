import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/components/layouts";
import { Toaster } from "@/components/ui/sonner";
import { ModalRoot } from "@/app/modals/modal-root";
import { Seo } from "@/components/seo/seo";
import { ErrorBoundary } from "@/components/errors/error-boundary";

export function RootLayout() {
  return (
    <>
      <Seo />
      <ErrorBoundary>
        <ResponsiveChatLayout>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <Toaster position="top-right" />
          <ModalRoot />
        </ResponsiveChatLayout>
      </ErrorBoundary>
    </>
  );
}
