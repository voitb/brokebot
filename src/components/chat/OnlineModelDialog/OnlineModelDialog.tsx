import React from "react";
import { Cloud, Key, AlertTriangle, TestTube } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ScrollArea } from "../../ui/scroll-area";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  FREE_LEARNING_MODELS,
  PAID_API_MODELS,
  OpenRouterClient,
  type OpenRouterModel,
} from "../../../lib/openrouter";
import { functions } from "../../../lib/appwriteClient";
import { hasApiKey } from "../../../lib/apiKeys";
import { toast } from "sonner";
import { ApiKeySection } from "./components/ApiKeySection";
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
  const isKeyStored = hasApiKey("openrouter");

  const handleModelSelect = (model: OpenRouterModel) => {
    if (!isKeyStored) {
      toast.error("Please add your OpenRouter API key first");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="block max-w-4xl h-[80vh] overflow-hidden px-0">
        <DialogHeader className="px-4 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Select Online AI Model
          </DialogTitle>
        </DialogHeader>

        <ApiKeySection provider="openrouter" />

        <Tabs defaultValue="free" className="flex-1 flex flex-col">
          <TabsList className="grid w-[calc(100%-2rem)] grid-cols-2 mx-4">
            <TabsTrigger value="free" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Free Models (Learning)
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Paid API Models
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(80vh-180px)] px-4 pb-4">
            <TabsContent value="free" className="flex-1 space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These models are free but learn from user conversations. Use
                  responsibly and avoid sharing sensitive information.
                </AlertDescription>
              </Alert>
              <ModelList
                models={[...FREE_LEARNING_MODELS]}
                selectedModel={selectedModel}
                onSelect={handleModelSelect}
                isFree
              />
            </TabsContent>
            <TabsContent value="paid" className="flex-1 space-y-4">
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
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
