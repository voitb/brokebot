import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { ChatInterface } from "./components/chat/ChatInterface";
import { ChatGuard } from "./components/chat/ChatGuard";
import { WelcomeScreen } from "./components/chat/WelcomeScreen";
import { Toaster } from "./components/ui/sonner";

function App() {
  console.log("🟢 App");
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
