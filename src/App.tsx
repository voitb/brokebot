import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { ChatInterface } from "./components/chat/interface";
import { ChatGuard } from "./components/chat/interface/components";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { TermsOfService } from "./pages/TermsOfService";
import { SharedChatPage } from "./pages/SharedChatPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/share/:shareId" element={<SharedChatPage />} />
        <Route
          path="/*"
          element={
            <ResponsiveChatLayout>
              <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route
                  path="/chat/*"
                  element={
                    <ChatGuard>
                      <ChatInterface />
                    </ChatGuard>
                  }
                />
              </Routes>
              <Toaster />
            </ResponsiveChatLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
