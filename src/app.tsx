import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/responsive-chat-layout";
import { Toaster } from "./components/ui/sonner";
import { ModalRoot } from "./components/modals/modal-root";
import { Seo } from './components/common/seo';
import { PerformanceSEO } from './components/common/performance-seo';

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
