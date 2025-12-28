import React, { useState } from "react";
import { ApiKeySection } from "./api-key-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OpenRouterIcon } from "@/components/ui/provider-icons";
import { createOpenRouterClient } from "@/lib/openrouter";
import { useUserConfig } from "@/shared/hooks/use-user-config";
import { toast } from "sonner";
import { TestTube, Loader2 } from "lucide-react";

const providers = [
  { id: "openrouter", name: "OpenRouter", icon: <OpenRouterIcon /> },
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
      const client = createOpenRouterClient(config.openrouterApiKey);
      const testResult = await client.testConnection();

      if (testResult.success) {
        toast.success("OpenRouter API key is working!");
      } else {
        toast.error(`API key test failed: ${testResult.error}`);
      }
    } catch {
      toast.error("Connection test failed.");
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
