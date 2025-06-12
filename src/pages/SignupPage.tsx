import { SignupForm } from "@/components/auth/SignupForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export const SignupPage: React.FC = () => {
  return (
    <ScrollArea className="h-screen">
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>
    </ScrollArea>
  );
};
