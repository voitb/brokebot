import React from "react";
import { MessageSquare, Zap, Shield, Cpu } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../hooks/useConversations";
import { ChatHeader } from "./chat/header";

/**
 * Welcome screen component showing app features and benefits
 */
export const WelcomeScreen: React.FC = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Chat with AI",
      description: "Start conversations with your local AI assistant",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant responses powered by WebLLM technology",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "All data stays on your device, no cloud required",
    },
    {
      icon: Cpu,
      title: "Runs Locally",
      description: "AI model runs entirely in your browser",
    },
  ];

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
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {!open && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Button variant="outline" size="sm" onClick={handleOpenNewChat}>
                + New Chat
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-6xl mb-4">💸</div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to Local-GPT
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your free, private AI assistant that runs entirely in your
              browser. No data leaves your device, no subscriptions required.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="border-muted">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Getting Started */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
            <p className="text-muted-foreground">
              Click "New Chat" in the sidebar or start typing below to begin
              your first conversation. The AI model will load automatically when
              you send your first message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
