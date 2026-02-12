import { z } from "zod";
import type { Conversation } from "@/lib/db";

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

// Compile-time assertion: schema and interface stay in sync
type _SchemaMatchesInterface = z.infer<typeof ConversationSchema> extends Conversation
  ? Conversation extends z.infer<typeof ConversationSchema>
    ? true
    : never
  : never;
const _typeCheck: _SchemaMatchesInterface = true;
void _typeCheck;
