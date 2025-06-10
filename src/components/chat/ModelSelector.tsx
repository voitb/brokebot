import React from "react";
import { ChevronDown, Cpu, HardDrive, Zap, AlertTriangle, Eye, Database, Code, Calculator, Shield } from "lucide-react";
import { Button } from "../ui/button";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useWebLLM, type ModelInfo } from "../../providers/WebLLMProvider";

interface ModelSelectorProps {
  disabled?: boolean;
}

/**
 * Model selector dropdown for choosing AI model
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  disabled = false,
}) => {
  const { selectedModel, availableModels, setSelectedModel } = useWebLLM();

  const handleModelSelect = (model: ModelInfo) => {
    setSelectedModel(model);
  };

  // Group models by category
  const modelsByCategory = availableModels.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "light":
        return <Zap className="w-3 h-3" />;
      case "medium":
        return <Cpu className="w-3 h-3" />;
      case "large":
        return <HardDrive className="w-3 h-3" />;
      case "heavy":
        return <AlertTriangle className="w-3 h-3" />;
      case "extreme":
        return <Shield className="w-3 h-3" />;
      default:
        return <Cpu className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "light":
        return "Light Models (0.5-4GB RAM)";
      case "medium":
        return "Medium Models (3-6GB RAM)";
      case "large":
        return "Large Models (6-10GB RAM)";
      case "heavy":
        return "Heavy Models (8-16GB RAM) - Resource Intensive";
      case "extreme":
        return "Extreme Models (16GB+ RAM) - High-End Hardware Only";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const getModelTypeIcon = (modelType: string) => {
    switch (modelType) {
      case "VLM":
        return <Eye className="w-3 h-3" />;
      case "embedding":
        return <Database className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getSpecializationIcon = (specialization?: string) => {
    switch (specialization) {
      case "coding":
        return <Code className="w-3 h-3" />;
      case "math":
        return <Calculator className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case "Basic":
        return "outline";
      case "Fast":
      case "Good":
        return "default";
      case "Balanced":
      case "High Quality":
        return "secondary";
      case "Excellent":
      case "Premium":
        return "destructive";
      case "Ultimate":
        return "destructive";
      case "Reasoning":
      case "Multimodal":
      case "Coding":
      case "Math":
      case "Embeddings":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryTooltip = (category: string) => {
    switch (category) {
      case "light":
        return "Fast, efficient models suitable for most devices including mobile";
      case "medium":
        return "Balanced performance and resource usage - good for laptops";
      case "large":
        return "High quality models requiring dedicated graphics or 8GB+ RAM";
      case "heavy":
        return "Excellent quality but very resource intensive - may slow down your device significantly";
      case "extreme":
        return "Ultimate performance models requiring high-end hardware with 16GB+ RAM";
      default:
        return "";
    }
  };

  // Sort categories by intensity
  const categoryOrder = ["light", "medium", "large", "heavy", "extreme"];
  const sortedCategories = Object.keys(modelsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
        >
          <Cpu className="w-3 h-3" />
          <span className="hidden sm:inline">{selectedModel.name}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <ScrollArea className="h-96">
          {sortedCategories.map((category) => {
            const models = modelsByCategory[category];
            return (
              <div key={category}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-help">
                      {getCategoryIcon(category)}
                      {getCategoryLabel(category)}
                    </DropdownMenuLabel>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getCategoryTooltip(category)}</p>
                  </TooltipContent>
                </Tooltip>
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className="flex flex-col items-start gap-2 p-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{model.name}</span>
                        {getModelTypeIcon(model.modelType)}
                        {getSpecializationIcon(model.specialization)}
                      </div>
                      <div className="flex gap-1">
                        <Badge 
                          variant={getPerformanceBadgeVariant(model.performance)} 
                          className="text-xs"
                        >
                          {model.performance}
                        </Badge>
                        {selectedModel.id === model.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 w-full">
                      <div className="flex items-center gap-1">
                        {model.description}
                        {model.warning && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{model.warning}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
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
                      {model.specialization && (
                        <div className="text-purple-600 dark:text-purple-400 font-medium">
                          Specialized: {model.specialization}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
