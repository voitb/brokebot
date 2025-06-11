import { useState, useEffect } from "react";
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
import { Eye, EyeOff, Cloud, HardDrive, Crown } from "lucide-react";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import { Badge } from "../../../ui/badge";
import { toast } from "sonner";

interface ApiKeysState {
  openai: string;
  anthropic: string;
  google: string;
}

interface UserInfo {
  isLoggedIn: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface IntegrationsTabProps {
  userInfo?: UserInfo;
}

/**
 * Hook to check privacy settings and determine storage method
 */
function usePrivacySettings(userInfo?: UserInfo) {
  const { config } = useUserConfig();

  // Use subscription status from props or fallback to mock
  const hasActiveSubscription = userInfo?.hasActiveSubscription ?? false;

  const shouldStoreInCloud =
    config.storeConversationsInCloud && hasActiveSubscription;
  const shouldStoreLocally = config.storeConversationsLocally;

  return {
    shouldStoreInCloud,
    shouldStoreLocally,
    hasActiveSubscription,
    isCloudStorageEnabled: config.storeConversationsInCloud,
  };
}

export function IntegrationsTab({ userInfo }: IntegrationsTabProps) {
  const { config, updateConfig } = useUserConfig();
  const { shouldStoreInCloud, shouldStoreLocally, hasActiveSubscription } =
    usePrivacySettings(userInfo);

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

  // Update state when config changes
  useEffect(() => {
    setApiKeys({
      openai: config.openaiApiKey || "",
      anthropic: config.anthropicApiKey || "",
      google: config.googleApiKey || "",
    });
  }, [config]);

  const handleApiKeyChange = async (
    provider: keyof ApiKeysState,
    value: string
  ) => {
    const newKeys = { ...apiKeys, [provider]: value };
    setApiKeys(newKeys);

    try {
      // Update config - encryption happens automatically in useUserConfig
      const updateField = `${provider}ApiKey` as keyof typeof config;
      await updateConfig({
        [updateField]: value,
      });

      if (value) {
        if (shouldStoreInCloud) {
          toast.success(
            `${provider.toUpperCase()} API key encrypted and saved to cloud`,
            {
              description:
                "Your key is securely stored and synced across devices",
            }
          );
        } else if (shouldStoreLocally) {
          toast.success(
            `${provider.toUpperCase()} API key encrypted and saved locally`,
            {
              description: "Your key is securely stored in your browser",
            }
          );
        }
      } else {
        toast.success(`${provider.toUpperCase()} API key removed`);
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key. Please try again.");

      // Revert the change
      setApiKeys((prev) => ({
        ...prev,
        [provider]:
          (config[`${provider}ApiKey` as keyof typeof config] as string) || "",
      }));
    }
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

  const getStorageInfo = () => {
    if (shouldStoreInCloud) {
      return {
        icon: <Cloud className="h-3 w-3" />,
        text: "Cloud Storage",
        description: "Keys are encrypted and synced across devices",
        variant: "default" as const,
      };
    } else if (shouldStoreLocally) {
      return {
        icon: <HardDrive className="h-3 w-3" />,
        text: "Local Storage",
        description: "Keys are encrypted and stored in your browser",
        variant: "secondary" as const,
      };
    } else {
      return {
        icon: <HardDrive className="h-3 w-3" />,
        text: "No Storage",
        description: "Keys will not be saved",
        variant: "destructive" as const,
      };
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">API Integrations</Label>
        <p className="text-sm text-muted-foreground">
          Connect external AI providers to access more models
        </p>
      </div>

      {/* Storage Status Card */}
      <Card className="bg-muted/30">
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge
              variant={storageInfo.variant}
              className="flex items-center gap-1"
            >
              {storageInfo.icon}
              {storageInfo.text}
            </Badge>
            {shouldStoreInCloud && hasActiveSubscription && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-500" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {storageInfo.description}
          </p>
        </CardContent>
      </Card>

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
                {integration.apiKey && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">
                      API key configured and encrypted
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground space-y-2">
        <p>
          🔒 All API keys are automatically encrypted before storage using
          AES-256-GCM encryption.
        </p>
        <p>
          API keys are only sent to their respective AI providers during API
          calls. Your keys are never shared with us or third parties.
        </p>
        {!shouldStoreLocally && !shouldStoreInCloud && (
          <p className="text-amber-600 dark:text-amber-400">
            ⚠️ Storage is disabled in Privacy settings. Your API keys will not
            be saved.
          </p>
        )}
      </div>
    </div>
  );
}
