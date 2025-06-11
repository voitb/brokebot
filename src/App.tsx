import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <ResponsiveChatLayout>
      <Outlet />
      <Toaster />
    </ResponsiveChatLayout>
  );
}

export default App;
