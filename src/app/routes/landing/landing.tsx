import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "@/features/chat/components/header/chat-header";
import { PageSeo } from "@/components/seo/seo";
import { WelcomeHeader } from "./welcome-header";
import { FeatureGrid } from "./feature-grid";
import { GettingStarted } from "./getting-started";
import { PrivacyNotice } from "./privacy-notice";

export function WelcomeScreen() {
  return (
    <>
      <PageSeo
        title="Welcome to BrokeBot"
        description="Your free, private AI chat assistant. It runs locally in your browser by default with WebLLM, and connects to OpenRouter only if you choose."
      />
      <div className="flex flex-col h-screen overflow-hidden">
        <ChatHeader />
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div className="max-w-4xl w-full text-center space-y-8">
              <WelcomeHeader />
              <FeatureGrid />
              <GettingStarted />
              <PrivacyNotice />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
