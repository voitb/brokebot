import React from "react";
import { AlertTriangle } from "lucide-react";
import { DropdownMenuItem } from "../../../ui/dropdown-menu";
import { Badge } from "../../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { type ModelInfo } from "../../../../providers/WebLLMProvider";
import { getModelTypeIcon, getSpecializationIcon, getPerformanceBadgeVariant } from "../utils/modelUtils";

interface ModelItemProps {
  model: ModelInfo;
  isActive: boolean;
  onSelect: (model: ModelInfo) => void;
}

export const ModelItem: React.FC<ModelItemProps> = ({ model, isActive, onSelect }) => {
  return (
    <DropdownMenuItem
      key={model.id}
      onClick={() => onSelect(model)}
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
          {isActive && (
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
  );
}; 