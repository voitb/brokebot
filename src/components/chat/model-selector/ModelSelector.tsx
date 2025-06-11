import React, { useState } from "react";
import { ChevronDown, Cpu, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ScrollArea } from "../../ui/scroll-area";
import { useWebLLM, type ModelInfo } from "../../../providers/WebLLMProvider";
import { OnlineModelDialog } from "../OnlineModelDialog";
import { type OpenRouterModel, type OpenRouterClient } from "../../../lib/openrouter";
import { useModelSelector } from "./hooks/useModelSelector";
import { ModelCategory } from "./components/ModelCategory";

interface ModelSelectorProps {
  disabled?: boolean;
  onOnlineModelSelect?: (model: OpenRouterModel, client: OpenRouterClient | null) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  disabled = false,
  onOnlineModelSelect,
}) => {
  const { selectedModel, availableModels, setSelectedModel } = useWebLLM();
  const [selectedOnlineModel, setSelectedOnlineModel] = useState<OpenRouterModel | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    sortedCategories,
    modelsByCategory,
  } = useModelSelector(availableModels);

  const handleModelSelect = (model: ModelInfo) => {
    setSelectedModel(model);
    setSelectedOnlineModel(null);
  };

  const handleOnlineModelSelect = (model: OpenRouterModel, client: OpenRouterClient | null) => {
    setSelectedOnlineModel(model);
    if (onOnlineModelSelect) {
      onOnlineModelSelect(model, client);
    }
  };

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
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">
              {selectedOnlineModel ? selectedOnlineModel.name : selectedModel.name}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>

          <ScrollArea className="h-96">
            {sortedCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No models found matching "{searchQuery}"
              </div>
            ) : (
              sortedCategories.map((category) => (
                <ModelCategory
                  key={category}
                  category={category}
                  models={modelsByCategory[category] || []}
                  activeModelId={selectedModel.id}
                  onSelectModel={handleModelSelect}
                />
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <OnlineModelDialog 
        onModelSelect={handleOnlineModelSelect}
        selectedModel={selectedOnlineModel}
      />
    </div>
  );
}; 