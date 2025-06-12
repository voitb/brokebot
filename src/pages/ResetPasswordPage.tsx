import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  useEffect(() => {
    if (!userId || !secret) {
      // If params are missing, redirect to home or an error page
      navigate("/");
    }
  }, [userId, secret, navigate]);

  if (!userId || !secret) {
    // Render nothing or a loading spinner while redirecting
    return null;
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <ResetPasswordForm userId={userId} secret={secret} />
        </div>
      </div>
    </ScrollArea>
  );
};
