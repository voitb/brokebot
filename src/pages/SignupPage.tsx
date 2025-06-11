import { SignupForm } from "@/components/auth/SignupForm";
import React from "react";

export const SignupPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}; 