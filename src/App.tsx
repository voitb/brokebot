import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { ChatInterface } from "./components/chat/interface";
import { ChatGuard } from "./components/chat/interface/components";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <ResponsiveChatLayout>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route
            path="/chat/:conversationId"
            element={
              <ChatGuard>
                <ChatInterface />
              </ChatGuard>
            }
          />
        </Routes>
        <Toaster />
      </ResponsiveChatLayout>
    </BrowserRouter>
  );
}

export default App;
