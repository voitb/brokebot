import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { Toaster } from "./components/ui/sonner";
import { ModalRoot } from "./components/modals";

function App() {
  return (
    <ResponsiveChatLayout>
      <Outlet />
      <Toaster />
      <ModalRoot />
    </ResponsiveChatLayout>
  );
}

export default App;
