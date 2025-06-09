import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResponsiveChatLayout } from "./components/layout/ResponsiveChatLayout";
import { ChatInterface } from "./components/chat/ChatInterface";
import { WelcomeScreen } from "./components/chat/WelcomeScreen";

function App() {
  console.log("🟢 App");
  return (
    <BrowserRouter>
      <ResponsiveChatLayout>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/chat/:conversationId" element={<ChatInterface />} />
        </Routes>
      </ResponsiveChatLayout>
    </BrowserRouter>
  );
}

export default App;
