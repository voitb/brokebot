import React from "react";

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground max-w-2xl mx-auto">
      <p>
        <span className="font-bold">Privacy Notice:</span> Local-GPT is designed
        for local and offline use, but you can optionally connect it to external
        AI services (like OpenAI, Anthropic, Google). Please be aware that when
        using these services, your conversations may be processed and stored by
        these companies according to their privacy policies and may be used for
        model training. To maintain full privacy, please use the default local
        model.
      </p>
    </div>
  );
};
