import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Badge } from "../../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";

interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

interface IntegrationsTabProps {
  apiKeys: ApiKeys;
  onApiKeysChange: (keys: ApiKeys) => void;
}

export function IntegrationsTab({
  apiKeys,
  onApiKeysChange,
}: IntegrationsTabProps) {
  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    onApiKeysChange({ ...apiKeys, [provider]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">API Integrations</Label>
        <p className="text-sm text-muted-foreground">
          Connect external AI services to access more models
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">OpenAI API</CardTitle>
              <Badge variant={apiKeys.openai ? "default" : "secondary"}>
                {apiKeys.openai ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <CardDescription>
              Access GPT-4, GPT-4 Turbo, and other OpenAI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={apiKeys.openai}
                onChange={(e) => handleKeyChange("openai", e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from OpenAI Platform
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Anthropic API</CardTitle>
              <Badge variant={apiKeys.anthropic ? "default" : "secondary"}>
                {apiKeys.anthropic ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <CardDescription>
              Access Claude models from Anthropic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="anthropic-key">API Key</Label>
              <Input
                id="anthropic-key"
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => handleKeyChange("anthropic", e.target.value)}
                placeholder="sk-ant-api..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Google AI Studio</CardTitle>
              <Badge variant={apiKeys.google ? "default" : "secondary"}>
                {apiKeys.google ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <CardDescription>Access Gemini models from Google</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="google-key">API Key</Label>
              <Input
                id="google-key"
                type="password"
                value={apiKeys.google}
                onChange={(e) => handleKeyChange("google", e.target.value)}
                placeholder="AIza..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
