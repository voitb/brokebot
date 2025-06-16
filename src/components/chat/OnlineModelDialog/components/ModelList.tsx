import React from "react";
import { type OpenRouterModel } from "../../../../lib/openrouter";
import { ModelCard } from "./ModelCard";

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

export const ModelList: React.FC<ModelListProps> = ({
  models,
  selectedModel,
  onSelect,
  isFree,
  availableKeys,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {models.map((model) => {
        // All OpenRouter models are enabled if the OpenRouter key is present.
        const isEnabled = !!availableKeys.openrouter;
        
        return (
          <ModelCard
            key={model.id}
            model={model}
            isSelected={selectedModel?.id === model.id}
            onSelect={onSelect}
            isFree={isFree}
            isEnabled={isEnabled}
          />
        );
      })}
    </div>
  );
};
