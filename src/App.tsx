import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { Toaster } from "./components/ui/sonner";
import { ModalRoot } from "./components/modals";
import { AuthProvider } from "./providers/AuthProvider"; 
import { ThemeProvider } from "./providers/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider> 
          <AuthProvider>
            <ResponsiveChatLayout>
              <Outlet />
              <Toaster />
              <ModalRoot />
            </ResponsiveChatLayout>
          </AuthProvider> 
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
