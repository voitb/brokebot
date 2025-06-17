import React from "react";
import { Cloud, Key, AlertTriangle, TestTube, Settings, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import {
  type OpenRouterModel,
  type OpenRouterClient,
} from "../../../lib/openrouter";
import { ApiKeysTab } from "./components/ApiKeysTab";
import { ModelList } from "./components/ModelList";
import { ScrollArea } from "@/components/ui";
import { useOnlineModels } from "./hooks/useOnlineModels";

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
  const {
    storedKeys,
    hasOpenRouterKey,
    hasPaidKey,
    handleModelSelect,
    handleOpenChange,
    freeModels,
    paidModels,
    isLoading,
    error,
  } = useOnlineModels(onModelSelect, onOpenChange);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Loader className="w-8 h-8 animate-spin" />
          <p className="ml-4">Loading models...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load models from OpenRouter. Please try again later.
              <br />
              <small>{error.message}</small>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return (
      <ScrollArea className="h-[calc(80vh-98px)]">
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
            models={freeModels}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
            isFree
            availableKeys={storedKeys}
          />
        </TabsContent>
        <TabsContent value="paid" className="space-y-4 p-4">
          {/* <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Premium models with enhanced capabilities. Your data remains
              private.
            </AlertDescription>
          </Alert>
          <ModelList
            models={paidModels}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
            isFree={false}
            availableKeys={storedKeys}
          /> */}
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              Premium model integration is currently in development. Soon you'll be able to access advanced AI models with enhanced capabilities while keeping your data private.
            </p>
          </div>
        </TabsContent>
      </ScrollArea>
    )
  }

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

          {renderContent()}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
