import { useState } from "react";
import { type ModelInfo } from "@/app/providers/web-llm-provider";

const CATEGORY_ORDER = ["light", "medium", "large", "heavy", "extreme"];

export interface UseModelSelectorReturn {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortedCategories: string[];
  modelsByCategory: Record<string, ModelInfo[]>;
}

export function useModelSelector(availableModels: readonly ModelInfo[]): UseModelSelectorReturn {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.toLowerCase().trim();

  const filteredModels = query
    ? availableModels.filter(model =>
        model.name.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        (model as ModelInfo & { specialization?: string }).specialization?.toLowerCase().includes(query) ||
        model.performance.toLowerCase().includes(query) ||
        model.category.toLowerCase().includes(query) ||
        model.modelType.toLowerCase().includes(query)
      )
    : availableModels;

  const modelsByCategory = filteredModels.reduce<Record<string, ModelInfo[]>>((acc, model) => {
    const category = model.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(model);
    return acc;
  }, {});

  const sortedCategories = Object.keys(modelsByCategory).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return {
    searchQuery,
    setSearchQuery,
    sortedCategories,
    modelsByCategory,
  };
} 