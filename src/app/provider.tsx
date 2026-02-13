import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { WebLLMProvider } from "@/app/providers/web-llm-provider";
import { ModelProvider } from "@/app/providers/model-provider";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { RouteLoadingFallback } from "@/components/ui/route-loading-fallback";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <HelmetProvider>
        <ThemeProvider>
          <TooltipProvider>
            <WebLLMProvider>
              <ModelProvider>
                <ConversationsProvider>
                  {children}
                </ConversationsProvider>
              </ModelProvider>
            </WebLLMProvider>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Suspense>
  );
}
