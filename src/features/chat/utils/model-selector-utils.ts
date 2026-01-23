import type { UnifiedModel } from "@/app/providers/model-provider";
import type { ModelInfo } from "@/app/providers/web-llm-provider";

interface GetDisplayNameParams {
  currentModel: UnifiedModel | null;
  activeLocalModel: ModelInfo | null;
}

export function getDisplayName({
  currentModel,
  activeLocalModel,
}: GetDisplayNameParams): string {
  if (!currentModel) return "Select Model";
  if (currentModel.type === "online") {
    return currentModel.onlineModel?.name ?? "Online Model";
  }
  return activeLocalModel?.name ?? currentModel.name;
}
