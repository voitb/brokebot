import { useMemo, useState } from "react";
import { type ModelInfo } from "../../../../providers/WebLLMProvider";

const categoryOrder = ["light", "medium", "large", "heavy", "extreme"];

export const useModelSelector = (availableModels: readonly ModelInfo[]) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return availableModels;
    
    const query = searchQuery.toLowerCase();
    return availableModels.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query) ||
      (model as ModelInfo & { specialization?: string }).specialization?.toLowerCase().includes(query) ||
      model.performance.toLowerCase().includes(query) ||
      model.category.toLowerCase().includes(query) ||
      model.modelType.toLowerCase().includes(query)
    );
  }, [availableModels, searchQuery]);

  const modelsByCategory = useMemo(() => {
    return filteredModels.reduce<Record<string, ModelInfo[]>>((acc, model) => {
      const category = model.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(model);
      return acc;
    }, {});
  }, [filteredModels]);

  const sortedCategories = useMemo(() => {
    return Object.keys(modelsByCategory).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }, [modelsByCategory]);

  return {
    searchQuery,
    setSearchQuery,
    sortedCategories,
    modelsByCategory,
  };
}; 