import React from "react";
import { ChevronDown, Cpu, HardDrive, Zap, AlertTriangle } from "lucide-react";
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
      default:
        return <Cpu className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "light":
        return "Light Models (1-4GB RAM)";
      case "medium":
        return "Medium Models (3-6GB RAM)";
      case "large":
        return "Large Models (6-10GB RAM)";
      case "heavy":
        return "Heavy Models (8-16GB RAM) - Resource Intensive";
      default:
        return category;
    }
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case "Fast":
        return "default";
      case "Balanced":
        return "secondary";
      case "High Quality":
        return "outline";
      case "Excellent":
        return "destructive";
      case "Reasoning":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryTooltip = (category: string) => {
    switch (category) {
      case "light":
        return "Fast models suitable for most devices";
      case "medium":
        return "Balanced performance and resource usage";
      case "large":
        return "High quality models requiring more resources";
      case "heavy":
        return "Excellent quality but very resource intensive - may slow down your device";
      default:
        return "";
    }
  };

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
          {Object.entries(modelsByCategory).map(([category, models]) => (
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
                    <span className="font-medium text-sm">{model.name}</span>
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
                    <div>{model.description}</div>
                    <div className="flex justify-between">
                      <span>Size: {model.size}</span>
                      <span>Download: {model.downloadSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requirements: {model.ramRequirement}</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
