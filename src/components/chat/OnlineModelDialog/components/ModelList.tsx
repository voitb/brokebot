import React from "react";
import { type OpenRouterModel } from "../../../../lib/openrouter";
import { type ApiKeys, hasApiKey } from "../../../../lib/apiKeys";
import { ModelCard } from "./ModelCard";

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
        const provider = model.provider.toLowerCase() as keyof ApiKeys;
        const isEnabled = isFree
          ? !!availableKeys.openrouter
          : hasApiKey(provider, availableKeys);
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
