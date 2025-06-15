import React, { useState } from "react";
import { ApiKeySection } from "./ApiKeySection";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { OpenRouterIcon } from "../../../ui/ProviderIcons";
import { OpenRouterClient } from "../../../../lib/openrouter";
import { functions } from "../../../../lib/appwriteClient";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import { toast } from "sonner";
import { TestTube, Loader2 } from "lucide-react";

// Focus only on OpenRouter for now - other providers commented out
const providers = [
  { id: "openrouter", name: "OpenRouter", icon: <OpenRouterIcon /> },
  // Future providers - commented out for now
  // { id: "openai", name: "OpenAI", icon: <OpenAIIcon /> },
  // { id: "google", name: "Google", icon: <GeminiIcon /> },
  // { id: "anthropic", name: "Anthropic", icon: <AnthropicIcon /> },
] as const;

export const ApiKeysTab: React.FC = () => {
  const { config } = useUserConfig();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!config?.openrouterApiKey) {
      toast.error("Please add your OpenRouter API key first");
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const client = new OpenRouterClient({
        functions,
        siteUrl: window.location.origin,
        siteName: "Local GPT",
        keys: {
          openrouterApiKey: config.openrouterApiKey,
        },
      });

      const testResult = await client.testApiKey();
      
      if (testResult.success) {
        toast.success("✅ OpenRouter API key is working!");
      } else {
        toast.error(`❌ OpenRouter API key test failed: ${testResult.error}`);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("Connection test failed. Check console for details.");
    } finally {
      setIsTestingConnection(false);
    }
  };

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
              {provider.id === "openrouter" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={!config?.openrouterApiKey || isTestingConnection}
                  className="text-xs"
                >
                  {isTestingConnection ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <TestTube className="w-3 h-3 mr-1" />
                  )}
                  Test Connection
                </Button>
              )}
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
