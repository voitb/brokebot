import React from "react";
import { ApiKeySection } from "./ApiKeySection";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import {
  GeminiIcon,
  AnthropicIcon,
  OpenAIIcon,
  OpenRouterIcon,
} from "../../../ui/ProviderIcons";

const providers = [
  { id: "openrouter", name: "OpenRouter", icon: <OpenRouterIcon /> },
  { id: "openai", name: "OpenAI", icon: <OpenAIIcon /> },
  { id: "google", name: "Google", icon: <GeminiIcon /> },
  { id: "anthropic", name: "Anthropic", icon: <AnthropicIcon /> },
] as const;

export const ApiKeysTab: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="grid gap-4 grid-cols-1">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {provider.icon}
                {provider.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ApiKeySection provider={provider.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
