import React, { useState, useEffect } from "react";
import { Cloud, Key, AlertTriangle, TestTube, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  FREE_LEARNING_MODELS,
  PAID_API_MODELS,
  OpenRouterClient,
  type OpenRouterModel,
} from "../../../lib/openrouter";
import { functions } from "../../../lib/appwriteClient";
import {
  getStoredApiKeys,
  hasApiKey,
  type ApiKeys,
} from "../../../lib/apiKeys";
import { toast } from "sonner";
import { ApiKeysTab } from "./components/ApiKeysTab";
import { ModelList } from "./components/ModelList";

interface OnlineModelDialogProps {
  onModelSelect: (
    model: OpenRouterModel,
    client: OpenRouterClient | null
  ) => void;
  selectedModel?: OpenRouterModel | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog for selecting online AI models from OpenRouter
 */
export const OnlineModelDialog: React.FC<OnlineModelDialogProps> = ({
  onModelSelect,
  selectedModel,
  open,
  onOpenChange,
}) => {
  const [storedKeys, setStoredKeys] = useState<ApiKeys>(getStoredApiKeys());
  const hasOpenRouterKey = !!storedKeys.openrouter;
  const hasPaidKey = !!(
    storedKeys.openai ||
    storedKeys.google ||
    storedKeys.anthropic
  );

  useEffect(() => {
    if (open) {
      setStoredKeys(getStoredApiKeys());
    }
  }, [open]);

  const handleModelSelect = (model: OpenRouterModel) => {
    if (!hasApiKey(model.provider as keyof ApiKeys)) {
      toast.error(`Please add your ${model.provider} API key first`);
      return;
    }

    const client = new OpenRouterClient({
      functions,
      siteUrl: window.location.origin,
      siteName: "Local GPT",
    });

    onModelSelect(model, client);
    onOpenChange?.(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setStoredKeys(getStoredApiKeys());
    }
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="block max-w-4xl h-[80vh] overflow-hidden p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Select Online AI Model
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="flex-1 flex flex-col h-full">
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="free"
              className="flex items-center gap-2"
              disabled={!hasOpenRouterKey}
            >
              <TestTube className="w-4 h-4" />
              Free Models
            </TabsTrigger>
            <TabsTrigger
              value="paid"
              className="flex items-center gap-2"
              disabled={!hasPaidKey}
            >
              <Key className="w-4 h-4" />
              Paid Models
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="api-keys">
              <ApiKeysTab />
            </TabsContent>
            <TabsContent value="free" className="space-y-4 p-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These models are free but may learn from conversations.
                </AlertDescription>
              </Alert>
              <ModelList
                models={[...FREE_LEARNING_MODELS]}
                selectedModel={selectedModel}
                onSelect={handleModelSelect}
                isFree
                availableKeys={storedKeys}
              />
            </TabsContent>
            <TabsContent value="paid" className="space-y-4 p-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Premium models with enhanced capabilities. Your data remains
                  private.
                </AlertDescription>
              </Alert>
              <ModelList
                models={[...PAID_API_MODELS]}
                selectedModel={selectedModel}
                onSelect={handleModelSelect}
                isFree={false}
                availableKeys={storedKeys}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
