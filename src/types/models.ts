export type {
  OpenRouterMessage,
  StreamResponse,
  OpenRouterModel,
  OpenRouterClient,
} from '@/features/chat/lib/openrouter';

export type { ModelType, UnifiedModel } from '@/app/providers/model-provider';

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
