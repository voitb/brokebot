// Re-export model types for convenience
export type {
  OpenRouterMessage,
  StreamResponse,
  OpenRouterModel,
  OpenRouterClient,
} from '@/lib/openrouter';

export type { ModelType, UnifiedModel } from '@/app/providers/model-provider';

// UI-specific types
export interface ConversationGroup {
  label: string;
  conversations: Array<{
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    isPinned?: boolean;
  }>;
}

export type QualityLevel = "high" | "medium" | "low";
