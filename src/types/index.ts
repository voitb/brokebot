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