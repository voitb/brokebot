import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import React from "react";

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}; 