export interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  parentId?: number;
}

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

export type ModelType = 'gemini' | 'gpt-4' | 'claude' | 'local';
export type QualityLevel = 'high' | 'medium' | 'low'; 