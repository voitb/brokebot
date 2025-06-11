import React, { useState } from "react";
import { ChevronDown, Cpu, Cloud, Search, Key } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useWebLLM, type ModelInfo } from "../../providers/WebLLMProvider";
import { useModel, createLocalModel, createOnlineModel } from "../../providers/ModelProvider";
import { OnlineModelDialog } from "./OnlineModelDialog";
import { type OpenRouterModel, OpenRouterClient } from "../../lib/openrouter";
import { hasApiKey } from "../../lib/apiKeys";
import { toast } from "sonner";

interface SimpleModelSelectorProps {
  disabled?: boolean;
}

/**
 * Simple model selector dropdown for choosing AI model (Local WebLLM or Online)
 */
export const SimpleModelSelector: React.FC<SimpleModelSelectorProps> = ({
  disabled = false,
}) => {
  const { selectedModel: webllmModel, availableModels } = useWebLLM();
  const { currentModel, setCurrentModel } = useModel();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if current model is online or local
  const isOnlineModel = currentModel?.type === 'online';
  const displayName = isOnlineModel 
    ? currentModel.onlineModel?.name || 'Online Model'
    : webllmModel.name;

  const handleLocalModelSelect = (model: ModelInfo) => {
    const localModel = createLocalModel(model);
    setCurrentModel(localModel);
  };

  const handleOnlineModelSelect = (model: OpenRouterModel, client: OpenRouterClient | null) => {
    if (!client) {
      toast.error("Failed to create OpenRouter client");
      return;
    }
    
    const onlineModel = createOnlineModel(model, client);
    setCurrentModel(onlineModel);
  };

  // Filter models based on search query
  const filteredModels = searchQuery.trim() 
    ? availableModels.filter((model: ModelInfo) => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableModels;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
          >
            {isOnlineModel ? <Cloud className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
            <span className="hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {/* Online Models Section */}
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cloud className="w-3 h-3" />
              Online Models
            </div>
            {hasApiKey('openrouter') ? (
              <Badge variant="default" className="text-xs">API Ready</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Key className="w-2 h-2 mr-1" />
                API Key Required
              </Badge>
            )}
          </DropdownMenuLabel>
          
          <OnlineModelDialog 
            onModelSelect={handleOnlineModelSelect}
            selectedModel={isOnlineModel ? currentModel.onlineModel : null}
            triggerAsMenuItem
          />
          
          <DropdownMenuSeparator />
          
          {/* Local Models Label */}
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Cpu className="w-3 h-3" />
            Local Models
          </DropdownMenuLabel>
          
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search local models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>

          <ScrollArea className="h-96">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No local models found matching "{searchQuery}"
              </div>
            ) : (
              filteredModels.map((model: ModelInfo) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => handleLocalModelSelect(model)}
                  className="flex flex-col items-start gap-2 p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {model.performance}
                      </Badge>
                      {!isOnlineModel && webllmModel.id === model.id && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 w-full">
                    <div className="flex items-center gap-1">
                      {model.description}
                    </div>
                    <div className="flex justify-between">
                      <span>Size: {model.size}</span>
                      <span>Download: {model.downloadSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requirements: {model.ramRequirement}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {model.category}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 