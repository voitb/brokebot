import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type ModelInfo } from "@/app/providers/web-llm-provider";
import { ModelItem } from "./model-item";
import { getCategoryIcon, getCategoryLabel, getCategoryTooltip } from "@/features/chat/components/model-icons/model-utils";

interface ModelCategoryProps {
  category: string;
  models: ModelInfo[];
  activeModelId: string;
  onSelectModel: (model: ModelInfo) => void;
}

export function ModelCategory({
  category,
  models,
  activeModelId,
  onSelectModel,
}: ModelCategoryProps) {
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