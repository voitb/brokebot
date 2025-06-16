import React from "react";
import { ScrollArea } from "../ui";
import { ChatHeader } from "../chat/header";
import {
  GettingStarted,
  WelcomeHeader,
  FeatureGrid,
  PrivacyNotice,
} from "./components";
import { SEOMetadata } from "../common/SEOMetadata";

export const WelcomeScreen: React.FC = () => { 
  return (
    <>
      <SEOMetadata
        title="Welcome to BrokeBot"
        description="Your local, private, and free AI chat assistant. Powered by WebLLM and running 100% in your browser."
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
};
