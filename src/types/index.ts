// Re-export domain types for convenience
export * from './database';
export * from './models';

// Local types
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