import { Brain, Eye, Zap, Cloud, Code } from "lucide-react";
import type { OpenRouterModel } from "@/features/chat/lib/openrouter";

export type OnlineModelCategory =
  | "reasoning"
  | "multimodal"
  | "efficient"
  | "general"
  | "instruction";

const CATEGORY_ICONS: Record<OnlineModelCategory, React.ReactNode> = {
  reasoning: <Brain className="w-3 h-3" />,
  multimodal: <Eye className="w-3 h-3" />,
  efficient: <Zap className="w-3 h-3" />,
  general: <Cloud className="w-3 h-3" />,
  instruction: <Code className="w-3 h-3" />,
};

export function getCategoryIcon(category: string): React.ReactNode {
  return CATEGORY_ICONS[category as OnlineModelCategory] ?? <Cloud className="w-3 h-3" />;
}

export function filterModelsByQuery(
  models: OpenRouterModel[],
  query: string
): OpenRouterModel[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return models;
  }

  return models.filter(
    (model) =>
      model.name.toLowerCase().includes(normalizedQuery) ||
      model.description.toLowerCase().includes(normalizedQuery) ||
      model.provider.toLowerCase().includes(normalizedQuery)
  );
}
