import { Brain, Eye, Zap, Cloud, Code } from "lucide-react";
import type { OpenRouterModel } from "@/features/chat/api/openrouter";
import type { OnlineModelCategory } from "@/lib/schemas/model-schema";

const CATEGORY_ICONS: Record<OnlineModelCategory, React.ReactNode> = {
  reasoning: <Brain className="w-3 h-3" />,
  multimodal: <Eye className="w-3 h-3" />,
  efficient: <Zap className="w-3 h-3" />,
  general: <Cloud className="w-3 h-3" />,
  instruction: <Code className="w-3 h-3" />,
};

export function getCategoryIcon(category: OnlineModelCategory): React.ReactNode {
  return CATEGORY_ICONS[category];
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
