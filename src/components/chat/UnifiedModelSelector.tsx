import React, { useState, useMemo } from "react";
import { ChevronDown, Cpu, Cloud, Search } from "lucide-react";
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

interface UnifiedModelSelectorProps {
  disabled?: boolean;
}

/**
 * Unified model selector for both local WebLLM and online OpenRouter models
 */
export const UnifiedModelSelector: React.FC<UnifiedModelSelectorProps> = ({
  disabled = false,
}) => {
  const { availableModels } = useWebLLM();
  const { currentModel, setCurrentModel } = useModel();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocalModelSelect = (localModel: ModelInfo) => {
    const unifiedModel = createLocalModel(localModel);
    setCurrentModel(unifiedModel);
  };

  const handleOnlineModelSelect = (onlineModel: OpenRouterModel, client: OpenRouterClient | null) => {
    // Client can be null since we'll create one with Appwrite Functions in createOnlineModel
    const unifiedModel = createOnlineModel(onlineModel, client || undefined);
    setCurrentModel(unifiedModel);
  };

  // Filter local models based on search query
  const filteredLocalModels = useMemo(() => {
    if (!searchQuery.trim()) return availableModels;
    
    const query = searchQuery.toLowerCase();
    return availableModels.filter((model: ModelInfo) => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      model.performance.toLowerCase().includes(query) ||
      model.category.toLowerCase().includes(query) ||
      model.modelType.toLowerCase().includes(query)
    );
  }, [availableModels, searchQuery]);

  // Group models by category
  const localModelsByCategory = useMemo(() => {
    const result: Record<string, ModelInfo[]> = {};
    filteredLocalModels.forEach((model: ModelInfo) => {
      const category = model.category;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(model);
    });
    return result;
  }, [filteredLocalModels]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "light": return "⚡";
      case "medium": return "🔧";
      case "large": return "🔥";
      case "heavy": return "⚠️";
      case "extreme": return "🛡️";
      default: return "🔧";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "light": return "Light Models (0.5-4GB RAM)";
      case "medium": return "Medium Models (3-6GB RAM)";
      case "large": return "Large Models (6-10GB RAM)";
      case "heavy": return "Heavy Models (8-16GB RAM)";
      case "extreme": return "Extreme Models (16GB+ RAM)";
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case "Basic": return "outline" as const;
      case "Fast":
      case "Good": return "default" as const;
      case "Balanced":
      case "High Quality": return "secondary" as const;
      case "Excellent":
      case "Premium": return "destructive" as const;
      case "Ultimate": return "destructive" as const;
      case "Reasoning":
      case "Multimodal":
      case "Coding":
      case "Math":
      case "Embeddings": return "secondary" as const;
      default: return "default" as const;
    }
  };

  // Sort categories by intensity
  const categoryOrder = ["light", "medium", "large", "heavy", "extreme"];
  const sortedCategories = Object.keys(localModelsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <div className="flex items-center gap-2">
      {/* Local Models Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
          >
            {currentModel?.type === 'online' ? <Cloud className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
            <span className="hidden sm:inline">
              {currentModel ? currentModel.name : "Select Model"}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
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
            {sortedCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No models found matching "{searchQuery}"
              </div>
            ) : (
              sortedCategories.map((category) => {
                const models = localModelsByCategory[category] || [];
                return (
                  <div key={category}>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span>{getCategoryIcon(category)}</span>
                      {getCategoryLabel(category)}
                      <Badge variant="outline" className="text-xs">
                        {models.length}
                      </Badge>
                    </DropdownMenuLabel>
                                         {models.map((model: ModelInfo) => (
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
                            <Badge 
                              variant={getPerformanceBadgeVariant(model.performance)} 
                              className="text-xs"
                            >
                              {model.performance}
                            </Badge>
                            {currentModel?.id === model.id && currentModel?.type === 'local' && (
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
                            {model.modelType && model.modelType !== 'LLM' && (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {model.modelType}
                              </span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                );
              })
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Online Models Dialog */}
      <OnlineModelDialog 
        onModelSelect={handleOnlineModelSelect}
        selectedModel={currentModel?.type === 'online' ? currentModel.onlineModel : null}
      />
    </div>
  );
}; 