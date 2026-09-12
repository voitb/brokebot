import { Logo } from "@/components/ui/logo";

export function WelcomeHeader() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Logo size="xl" className="mb-4" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">
        Welcome to brokebot
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Your free, private AI assistant. It runs locally in your browser by
        default, and connects to OpenRouter only if you choose to. No
        subscriptions required.
      </p>
    </div>
  );
}