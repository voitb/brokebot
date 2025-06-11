import React, { useState, useEffect } from "react";
import {
  Cloud,
  Key,
  AlertTriangle,
  Zap,
  Brain,
  Eye,
  Code,
  TestTube,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  FREE_LEARNING_MODELS,
  PAID_API_MODELS,
  OpenRouterClient,
  type OpenRouterModel,
} from "../../lib/openrouter";
import { functions } from "../../lib/appwriteClient";
import { getStoredApiKeys, storeApiKey, removeApiKey, hasApiKey, maskApiKey } from "../../lib/apiKeys";
import { toast } from "sonner";

interface OnlineModelDialogProps {
  onModelSelect: (
    model: OpenRouterModel,
    client: OpenRouterClient | null
  ) => void;
  selectedModel?: OpenRouterModel | null;
  triggerAsMenuItem?: boolean;
}

/**
 * Dialog for selecting online AI models from OpenRouter
 */
export const OnlineModelDialog: React.FC<OnlineModelDialogProps> = ({
  onModelSelect,
  selectedModel,
  triggerAsMenuItem = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    const keys = getStoredApiKeys();
    setHasStoredKey(hasApiKey('openrouter'));
    if (keys.openrouter) {
      setApiKey(maskApiKey(keys.openrouter));
    }
  }, []);

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    storeApiKey('openrouter', apiKey);
    setHasStoredKey(true);
    setApiKey(maskApiKey(apiKey));
    toast.success("API key saved successfully");
  };

  const handleApiKeyRemove = () => {
    removeApiKey('openrouter');
    setHasStoredKey(false);
    setApiKey("");
    toast.success("API key removed");
  };

  const handleModelSelect = (model: OpenRouterModel) => {
    if (!hasStoredKey) {
      toast.error("Please add your OpenRouter API key first");
      return;
    }

    // Use stored API key with OpenRouter client  
    const client = new OpenRouterClient({
      functions,
      siteUrl: window.location.origin,
      siteName: "Local GPT",
    });

    onModelSelect(model, client);
    setIsOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reasoning": return <Brain className="w-4 h-4" />;
      case "multimodal": return <Eye className="w-4 h-4" />;
      case "efficient": return <Zap className="w-4 h-4" />;
      case "general": return <Cloud className="w-4 h-4" />;
      case "instruction": return <Code className="w-4 h-4" />;
      default: return <Cloud className="w-4 h-4" />;
    }
  };

  if (triggerAsMenuItem) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
            onClick={() => setIsOpen(true)}
          >
            <Cloud className="w-4 h-4" />
            Browse Online Models
            {hasStoredKey && (
              <Badge variant="default" className="text-xs ml-auto">Ready</Badge>
            )}
          </div>
        </DialogTrigger>
      <DialogContent className="block max-w-4xl h-[80vh] overflow-hidden px-0">
        <DialogHeader className="px-4 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Select Online AI Model
          </DialogTitle>
        </DialogHeader>

        {/* API Key Configuration */}
        <div className="px-4 mb-4 space-y-3">
          <Label htmlFor="api-key" className="text-sm font-medium">
            OpenRouter API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type={hasStoredKey ? "text" : "password"}
              placeholder={hasStoredKey ? "API key configured" : "Enter your OpenRouter API key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              disabled={hasStoredKey && apiKey.includes('••••')}
            />
            {hasStoredKey ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleApiKeyRemove}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleApiKeySave}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}
          </div>
          {!hasStoredKey && (
            <p className="text-xs text-muted-foreground">
              Get your free API key from{" "}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          )}
        </div>

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

          <ScrollArea className="h-[calc(80vh-106px)] px-4 pb-4">
            <TabsContent value="free" className="flex-1 space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These models are free but learn from user conversations. Use
                  responsibly and avoid sharing sensitive information.
                </AlertDescription>
              </Alert>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  API keys are securely stored locally and encrypted.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FREE_LEARNING_MODELS.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedModel?.id === model.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(model.category)}
                          {model.name}
                        </div>
                        <Badge variant="secondary" className="text-xs">FREE</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          Learns from prompts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="paid" className="flex-1 space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Premium models with enhanced capabilities. Your data remains private.
                </AlertDescription>
              </Alert>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  API keys are securely configured in Appwrite Functions. No additional setup required.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAID_API_MODELS.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedModel?.id === model.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(model.category)}
                          {model.name}
                        </div>
                        <Badge variant="default" className="text-xs">PAID</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{model.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Cloud className="w-4 h-4" />
          Online Models
        </Button>
      </DialogTrigger>
      <DialogContent className="block max-w-4xl h-[80vh] overflow-hidden px-0">
        <DialogHeader className="px-4 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Select Online AI Model
          </DialogTitle>
        </DialogHeader>

        {/* API Key Configuration */}
        <div className="px-4 mb-4 space-y-3">
          <Label htmlFor="api-key" className="text-sm font-medium">
            OpenRouter API Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type={hasStoredKey ? "text" : "password"}
              placeholder={hasStoredKey ? "API key configured" : "Enter your OpenRouter API key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              disabled={hasStoredKey && apiKey.includes('••••')}
            />
            {hasStoredKey ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleApiKeyRemove}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleApiKeySave}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            )}
          </div>
          {!hasStoredKey && (
            <p className="text-xs text-muted-foreground">
              Get your free API key from{" "}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          )}
        </div>

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

          <ScrollArea className="h-[calc(80vh-106px)] px-4 pb-4">
            <TabsContent value="free" className="flex-1 space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These models are free but learn from user conversations. Use
                  responsibly and avoid sharing sensitive information.
                </AlertDescription>
              </Alert>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  API keys are securely stored locally and encrypted.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FREE_LEARNING_MODELS.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedModel?.id === model.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(model.category)}
                          {model.name}
                        </div>
                        <Badge variant="secondary" className="text-xs">FREE</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          Learns from prompts
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="paid" className="flex-1 space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Premium models with enhanced capabilities. Your data remains private.
                </AlertDescription>
              </Alert>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  API keys are securely stored locally and encrypted.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAID_API_MODELS.map((model) => (
                  <Card 
                    key={model.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedModel?.id === model.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(model.category)}
                          {model.name}
                        </div>
                        <Badge variant="default" className="text-xs">PAID</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{model.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
