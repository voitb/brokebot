import React from "react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button, ScrollArea } from "../ui";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../hooks/useConversations";
import { ChatHeader } from "../chat/header";
import {
  GettingStarted,
  WelcomeHeader,
  FeatureGrid,
  PrivacyNotice,
} from "./components";

export const WelcomeScreen: React.FC = () => {
  const { open } = useSidebar();
  const { createEmptyConversation } = useConversations();
  const navigate = useNavigate();

  const handleOpenNewChat = async () => {
    const conversationId = await createEmptyConversation("New Conversation");
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  return (
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
  );
};
