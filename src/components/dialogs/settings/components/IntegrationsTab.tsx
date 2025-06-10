import { useState } from "react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useUserConfig } from "../../../../hooks/useUserConfig";

interface ApiKeysState {
  openai: string;
  anthropic: string;
  google: string;
}

export function IntegrationsTab() {
  const { config, updateConfig } = useUserConfig();

  // Initialize with config values
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({
    openai: config.openaiApiKey || "",
    anthropic: config.anthropicApiKey || "",
    google: config.googleApiKey || "",
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });

  const handleApiKeyChange = (provider: keyof ApiKeysState, value: string) => {
    const newKeys = { ...apiKeys, [provider]: value };
    setApiKeys(newKeys);

    // Update config with new key
    const updateField = `${provider}ApiKey` as keyof typeof config;
    updateConfig({
      [updateField]: value,
    });
  };

  const toggleShowKey = (provider: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const integrations = [
    {
      id: "openai" as const,
      name: "OpenAI",
      description: "GPT-4, GPT-3.5, and other OpenAI models",
      apiKey: apiKeys.openai,
    },
    {
      id: "anthropic" as const,
      name: "Anthropic",
      description: "Claude models for advanced reasoning",
      apiKey: apiKeys.anthropic,
    },
    {
      id: "google" as const,
      name: "Google AI",
      description: "Gemini and other Google AI models",
      apiKey: apiKeys.google,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">API Integrations</Label>
        <p className="text-sm text-muted-foreground">
          Connect external AI providers to access more models
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle className="text-sm">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`${integration.id}-key`}>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id={`${integration.id}-key`}
                    type={showKeys[integration.id] ? "text" : "password"}
                    value={integration.apiKey}
                    onChange={(e) =>
                      handleApiKeyChange(integration.id, e.target.value)
                    }
                    placeholder="Enter your API key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleShowKey(integration.id)}
                    className="shrink-0"
                  >
                    {showKeys[integration.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          API keys are stored locally in your browser and are only sent to the
          respective AI providers. Your keys are never shared with us or third
          parties.
        </p>
      </div>
    </div>
  );
}
