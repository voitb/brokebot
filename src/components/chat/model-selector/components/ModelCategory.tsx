import React from "react";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../ui/dropdown-menu";
import { Badge } from "../../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { type ModelInfo } from "../../../../providers/WebLLMProvider";
import { ModelItem } from "./ModelItem";
import { getCategoryIcon, getCategoryLabel, getCategoryTooltip } from "../utils/modelUtils";

interface ModelCategoryProps {
  category: string;
  models: ModelInfo[];
  activeModelId: string;
  onSelectModel: (model: ModelInfo) => void;
}

export const ModelCategory: React.FC<ModelCategoryProps> = ({
  category,
  models,
  activeModelId,
  onSelectModel,
}) => {
  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-help">
            {getCategoryIcon(category)}
            {getCategoryLabel(category)}
            <Badge variant="outline" className="text-xs">
              {models.length}
            </Badge>
          </DropdownMenuLabel>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getCategoryTooltip(category)}</p>
        </TooltipContent>
      </Tooltip>
      {models.map((model) => (
        <ModelItem
          key={model.id}
          model={model}
          isActive={activeModelId === model.id}
          onSelect={onSelectModel}
        />
      ))}
      <DropdownMenuSeparator />
    </div>
  );
}; 