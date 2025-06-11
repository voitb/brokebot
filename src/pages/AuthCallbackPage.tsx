import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export function AuthCallbackPage() {
  const { getCurrentUser, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // This page is hit on redirect from OAuth provider.
      // We need to call getCurrentUser to ensure the session is correctly handled
      // and the user state is updated.
      await getCurrentUser();
    };

    handleAuthCallback();
  }, [getCurrentUser]);

  useEffect(() => {
    // Wait for the loading to be false
    if (!isLoading) {
      if (user) {
        // If user is successfully fetched, redirect to chat
        navigate("/chat");
      } else {
        // If user is null after trying to fetch, something went wrong
        navigate("/login?error=auth_failed");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-semibold text-muted-foreground">
          Finalizing authentication...
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait while we securely log you in.
        </p>
      </div>
    </div>
  );
} 