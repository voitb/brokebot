import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <ScrollArea className="h-screen">
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </ScrollArea>
  );
};
