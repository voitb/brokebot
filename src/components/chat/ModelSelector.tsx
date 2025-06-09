import React from "react";
import { ChevronDown, Cpu } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
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
      <DropdownMenuContent align="start" className="w-64">
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelSelect(model)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.size} • {model.description}
              </span>
            </div>
            {selectedModel.id === model.id && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
