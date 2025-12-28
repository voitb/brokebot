import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/features/layout/components/responsive-chat-layout";
import { Toaster } from "@/components/ui/sonner";
import { ModalRoot } from "@/app/modals/modal-root";
import { Seo } from "@/shared/components/common/seo";
import { PerformanceSEO } from "@/shared/components/common/performance-seo";

function App() {
  return (
    <>
      <Seo />
      <PerformanceSEO enableWebVitals={true} />
      <ResponsiveChatLayout>
        <Outlet />
        <Toaster position="top-right" />
        <ModalRoot />
      </ResponsiveChatLayout>
    </>
  );
}

export default App;
