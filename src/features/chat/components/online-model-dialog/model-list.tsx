import { useState } from "react";
import { Search } from "lucide-react";
import { type OpenRouterModel } from "@/features/chat/api/openrouter";
import { Input } from "@/components/ui/input";
import { filterModelsByQuery } from "@/features/chat/utils/online-model-utils";
import { ModelCard } from "./model-card";

interface ApiKeys {
  openrouter?: string | null;
  openai?: string | null;
  google?: string | null;
  anthropic?: string | null;
}

interface ModelListProps {
  models: OpenRouterModel[];
  selectedModel?: OpenRouterModel | null;
  onSelect: (model: OpenRouterModel) => void;
  isFree: boolean;
  availableKeys: ApiKeys;
}

export function ModelList({
  models,
  selectedModel,
  onSelect,
  isFree,
  availableKeys,
}: ModelListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredModels = filterModelsByQuery(models, searchQuery);
  const isEnabled = !!availableKeys.openrouter;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredModels.length === 0 && searchQuery.trim() ? (
        <div className="text-center py-8 text-muted-foreground">
          No models found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={selectedModel?.id === model.id}
              onSelect={onSelect}
              isFree={isFree}
              isEnabled={isEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
