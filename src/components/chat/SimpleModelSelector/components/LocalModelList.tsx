import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../../../ui/input";
import { ScrollArea } from "../../../ui/scroll-area";
import { Badge } from "../../../ui/badge";
import { DropdownMenuItem } from "../../../ui/dropdown-menu";
import { type ModelInfo } from "../../../../providers/WebLLMProvider";

interface LocalModelListProps {
  availableModels: ModelInfo[];
  webllmModel: ModelInfo;
  onSelect: (model: ModelInfo) => void;
}

export const LocalModelList: React.FC<LocalModelListProps> = ({
  availableModels,
  webllmModel,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = searchQuery.trim()
    ? availableModels.filter(
        (model) =>
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableModels;

  return (
    <>
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
              onClick={() => onSelect(model)}
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
                  {webllmModel.id === model.id && (
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
    </>
  );
};
