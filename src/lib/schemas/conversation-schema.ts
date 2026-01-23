import { z } from "zod";

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.coerce.date(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(MessageSchema),
  pinned: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  modelId: z.string().optional(),
  folderId: z.string().optional(),
});

export type ValidatedConversation = z.infer<typeof ConversationSchema>;
