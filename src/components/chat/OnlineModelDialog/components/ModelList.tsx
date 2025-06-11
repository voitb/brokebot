import React from "react";
import { type OpenRouterModel } from "../../../../lib/openrouter";
import { ModelCard } from "./ModelCard";

interface ModelListProps {
  models: OpenRouterModel[];
  selectedModel?: OpenRouterModel | null;
  onSelect: (model: OpenRouterModel) => void;
  isFree: boolean;
}

export const ModelList: React.FC<ModelListProps> = ({
  models,
  selectedModel,
  onSelect,
  isFree,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          isSelected={selectedModel?.id === model.id}
          onSelect={onSelect}
          isFree={isFree}
        />
      ))}
    </div>
  );
};
