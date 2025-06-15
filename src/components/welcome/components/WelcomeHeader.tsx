import React from "react";
import { Logo } from "../../ui/Logo";

export const WelcomeHeader: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-center">
          <Logo size="xl" className="mb-4" />
    </div>
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to BrokeBot
      </h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      Your free, private AI assistant that runs entirely in your browser. No
      data leaves your device, no subscriptions required.
    </p>
  </div>
); 