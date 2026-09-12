import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/components/layouts/responsive-chat-layout";
import { Toaster } from "@/components/ui/sonner";
import { ModalRoot } from "@/app/modals/modal-root";
import { Seo } from "@/components/seo/seo";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { ConversationList } from "@/features/chat/components/sidebar/conversation-list";
import { OnboardingDialog } from "@/features/onboarding/components/onboarding-dialog";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding";

export function RootLayout() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <>
      <Seo />
      <ErrorBoundary>
        <ResponsiveChatLayout
          sidebar={<ConversationList />}
          onboarding={<OnboardingDialog isOpen={showOnboarding} onClose={completeOnboarding} />}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <Toaster position="top-right" />
          <ModalRoot />
        </ResponsiveChatLayout>
      </ErrorBoundary>
    </>
  );
}
