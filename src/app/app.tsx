import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/features/layout";
import { Toaster } from "@/components/ui/sonner";
import { ModalRoot } from "@/app/modals/modal-root";
import { Seo } from "@/components/seo/seo";
import { PerformanceSEO } from "@/components/seo/performance-seo";
import { ErrorBoundary } from "@/components/error-boundary";

function App() {
  return (
    <>
      <Seo />
      <PerformanceSEO enableWebVitals={true} />
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

export default App;
