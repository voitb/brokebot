import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { Toaster } from "./components/ui/sonner";
import { ModalRoot } from "./components/modals";
import { Seo, PerformanceSEO } from './components/common';

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
