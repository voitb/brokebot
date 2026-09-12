export function PrivacyNotice() {
  return (
    <div className="text-xs text-muted-foreground max-w-2xl mx-auto">
      <p>
        <span className="font-bold">Privacy Notice:</span> brokebot runs
        locally by default. You can optionally connect it to OpenRouter with
        your own API key. When you do, the messages you send are processed by
        OpenRouter and by the model provider it routes them to, under their
        privacy policies, and may be used for model training. To keep everything
        on your device, use a local model.
      </p>
    </div>
  );
}
