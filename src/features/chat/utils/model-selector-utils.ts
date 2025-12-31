import type { UnifiedModel } from "@/app/providers/model-provider";
import type { ModelInfo } from "@/app/providers/web-llm-provider";

interface GetDisplayNameParams {
  currentModel: UnifiedModel | null;
  activeLocalModel: ModelInfo;
}

/**
 * Returns the display name for the current model.
 * Handles three states: initializing, online model, and local model.
 */
export function getDisplayName({
  currentModel,
  activeLocalModel,
}: GetDisplayNameParams): string {
  if (!currentModel) return "Initializing...";
  if (currentModel.type === "online") {
    return currentModel.onlineModel?.name ?? "Online Model";
  }
  return activeLocalModel.name;
}
