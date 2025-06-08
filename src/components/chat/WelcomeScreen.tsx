export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
      <div className="text-center max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to BrokeBot 💸
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-2">
            Your free, local AI assistant
          </p>
          <p className="text-sm lg:text-base text-muted-foreground">
            Powered by WebLLM - runs entirely in your browser
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div className="p-4 lg:p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="text-2xl lg:text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2 text-sm lg:text-base">
              100% Private
            </h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              All conversations stay on your device. No data sent to servers.
            </p>
          </div>
          <div className="p-4 lg:p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="text-2xl lg:text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-sm lg:text-base">
              Local AI
            </h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Powered by WebLLM technology running directly in your browser.
            </p>
          </div>
          <div className="p-4 lg:p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="text-2xl lg:text-3xl mb-3">💸</div>
            <h3 className="font-semibold mb-2 text-sm lg:text-base">
              Always Free
            </h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              No subscriptions, no API keys required. Just pure local AI.
            </p>
          </div>
          <div className="p-4 lg:p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <div className="text-2xl lg:text-3xl mb-3">📁</div>
            <h3 className="font-semibold mb-2 text-sm lg:text-base">
              File Support
            </h3>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Upload and chat about your text files and documents.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm lg:text-base text-muted-foreground mb-6">
            Click "New Chat" in the sidebar to get started
          </p>
          <div className="flex items-center justify-center gap-2 text-xs lg:text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 px-4 py-2 rounded-full border border-green-200 dark:border-green-800 inline-flex">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Local AI Ready
          </div>
        </div>
      </div>
    </div>
  );
}
